const request = require('request');
const logger = require('./logger');
const resolver = require('./resolvers/mocha');
const stripAnsi = require('strip-ansi');

module.exports = jobId => {
    logger.log(`Testing job '${jobId}'`);
    return new Promise(resolve => {
        request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
            if (err) return reject(err);

            logger.log(`Resolving log... (length: ${log.length})`);

            log = stripAnsi(log);

            resolver(log, {}, resolve);
        });
    });
}