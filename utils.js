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
                logger.log(`Done not found, requesting new log...`, data);

                if (attempts >= MAX_ATTEMPTS_TO_GET_DONE) {
                    return reject(`Too many attempts to find done (MAX_ATTEMPTS: ${MAX_ATTEMPTS_TO_GET_DONE})`);
                } else {
                    setTimeout(() => requestLog(++attempts).then(resolve).catch(reject), 1000);
                }
            } else {
                logger.log(`Done found after ${attempts}/${MAX_ATTEMPTS_TO_GET_DONE} attempts.`, data);

                log = stripAnsi(log);
                return resolve(log);
            }
        });
    });
};

module.exports.getData = (payload, mode) => ({
    owner: payload.repository.owner_name,
    repo: payload.repository.name,
    mode: mode,
    pullRequest: payload.pull_request_number,
    pullRequestTitle: payload.pull_request_title,
    buildNumber: payload.id,
    jobId: payload.matrix[0].id,
    author: payload.author_name,
    state: payload.state,
    branch: payload.branch,
    travisType: payload.type,
});

module.exports.formatMessage = message => {
    const template = fs.readFileSync('./comment-template.md', 'utf8');
    return template
            .replace('{author}', message.author)
            .replace('{contents}', message.contents);
}