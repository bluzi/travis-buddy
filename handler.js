const GitHub = require('github-api');
const request = require('request');
const resolvers = require('./resolvers.json');
const path = require('path');
const logger = require('./logger');
const stripAnsi = require('strip-ansi');


const MAX_ATTEMPTS_TO_GET_DONE = 10;

module.exports = (owner, repo, jobId, prNumber, author, mode) => {
    return new Promise((resolve, reject) => {
        logger.log(`#${prNumber}: Looking for a resolver for mode '${mode}'`);

        const resolverPath = resolvers.find(resolver => resolver.mode = mode).path;
        const resolver = require(resolverPath);

        logger.log(`#${prNumber}: Resolver found in: '${resolverPath}'`);

        (function requestLog(attempts = 0) {
            request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
                if (err) return reject(err);

                const lastLine = log.trim().split(/\r?\n/).pop();
                if (lastLine.startsWith('Done.') === false) {
                    logger.log(`#${prNumber}: Done not found, requesting new log...`);

                    if (attempts >= MAX_ATTEMPTS_TO_GET_DONE) {
                        logger.error(`#${prNumber}: Too many attempts to find done (MAX_ATTEMPTS: ${MAX_ATTEMPTS_TO_GET_DONE})`);
                    } else {
                        setTimeout(() => requestLog(++attempts), 1000);
                    }
                } else {
                    logger.log(`#${prNumber}: Done found after ${attempts}/${MAX_ATTEMPTS_TO_GET_DONE} attempts.`);
                    logger.log(`#${prNumber}: Resolving log... (length: ${log.length})`);

                    log = stripAnsi(log);
                    resolver(log, {}, comment);
                }
            });
        })();

        function comment(message) {
            const gh = new GitHub({
                token: process.env.githubAccessToken
            });

            message.author = author;

            const contents = formatMessage(message);

            const issues = gh.getIssues(owner, repo);

            logger.log(`#${prNumber}:Attempting to create comment on PR #${prNumber} (${owner}/${repo})`);

            issues.createIssueComment(prNumber, contents)
                .then(result => {
                    logger.log(`#${prNumber}: Comment created on PR #${prNumber}`);
                    resolve();
                })
                .catch(() => logger.error(`#${prNumber}: Error: Could not create comment`))
        }
    });
}

function formatMessage(message) {
    return `## Travis tests has failed
Hey **${message.author}**, 
Please read the following log in order to understand why the tests failed. 
It'll be awesome if you fix what's wrong and commit the changes.

${message.contents}

**Powered by:** [Travis Buddy](https://github.com/bluzi/travis-buddy)
`;
}
