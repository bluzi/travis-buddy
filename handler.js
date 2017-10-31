const GitHub = require('github-api');
const request = require('request');
const resolvers = require('./resolvers.json');
const path = require('path');

module.exports = (owner, repo, jobId, prNumber, author, mode) => {
    return new Promise((resolve, reject) => {
        logger.log(`Looking for a resolver for mode '${mode}'`);

        const resolverPath = resolvers.find(resolver => resolver.mode = mode).path;
        const resolver = require(resolverPath);

        logger.log(`Resolver found in: '${resolverPath}'`);

        request(`https://api.travis-ci.org/jobs/${jobId}/log`, (err, response, log) => {
            logger.log(`Resolving log... (length: ${log.length})`);
            resolver(log, {}, comment);
        });

        function comment(message) {
            const gh = new GitHub({
                token: process.env.githubAccessToken
            });

            message.author = author;

            const contents = formatMessage(message);

            const issues = gh.getIssues(owner, repo);

            logger.log(`Attempting to create comment on PR #${prNumber} (${owner}/${repo})`);
            logger.log('Issue content:');
            logger.log(contents);

            issues.createIssueComment(prNumber, contents)
                .then(result => {
                    logger.log(`Comment created on PR #${prNumber}`);
                    resolve();
                })
                .catch(() => logger.error(`Error: Could not create comment on PR #${prNumber}`))
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
