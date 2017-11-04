const logger = require('./logger');
const request = require('request');
const stripAnsi = require('strip-ansi');
const fs = require('fs');


const MAX_ATTEMPTS_TO_GET_DONE = 10;

module.exports.requestLog = (jobId, data, attempts = 0) => {
    return new Promise((resolve, reject) => {
        request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
            if (err) return reject(err);

            const lastLine = log.trim().split(/\r?\n/).pop();
            if (lastLine.startsWith('Done.') === false) {
                if (attempts >= MAX_ATTEMPTS_TO_GET_DONE) {
                    logger.log(`Done not found, requesting new log... (${attempts}/${MAX_ATTEMPTS_TO_GET_DONE}`, data);
                    return reject(`Too many attempts to find done (MAX_ATTEMPTS: ${MAX_ATTEMPTS_TO_GET_DONE})`);
                } else {
                    setTimeout(() => module.exports.requestLog(++attempts).then(resolve).catch(reject), 1000);
                }
            } else {
                logger.log(`Done found after ${attempts}/${MAX_ATTEMPTS_TO_GET_DONE} attempts.`, data);

                log = stripAnsi(log);
                return resolve(log);
            }
        });
    });
};

module.exports.getData = (payload, params) => ({
    params: params,

    owner: payload.repository.owner_name,
    repo: payload.repository.name,
    pullRequest: payload.pull_request_number,
    pullRequestTitle: payload.pull_request_title,
    buildNumber: payload.id,
    jobId: payload.matrix[0].id,
    author: payload.author_name,
    state: payload.state,
    branch: payload.branch,
    travisType: payload.type,
    language: payload.config.language,
    scripts: payload.config.script,
});

module.exports.formatMessage = message => {
    const template = fs.readFileSync('resources/comment-template.md', 'utf8');

    const contents = Object.entries(message.logs)
        .map(curr => `### ${curr[0]}\n${curr[1]}`)
        .join('\n\n');

    return template
            .replace('{author}', message.author)
            .replace('{contents}', contents);
}