const request = require('request');
const logger = require('./logger');
const resolver = require('./resolvers/mocha');
const stripAnsi = require('strip-ansi');

module.exports = jobId => {
    logger.log(`Testing job '${jobId}'`);
    return new Promise(resolve => {
        (function requestLog() {
            request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
                if (err) return reject(err);

                const lastLine = log.trim().split(/\r?\n/).pop();
                if (lastLine.startsWith('Done.') === false) {
                    setTimeout(requestLog, 1000);
                } else {
                    logger.log(`Resolving log... (length: ${log.length})`);

                    log = stripAnsi(log);
                    resolver(log, {}, resolve);
                }
            });
        })();
    });
}