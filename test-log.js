const logger = require('./logger');
const resolver = require('./resolvers/general');
const utils = require('./utils');

module.exports = jobId => {
    logger.log(`Testing job '${jobId}'`);
    return new Promise((resolve, reject) => {
        utils.requestLog(jobId)
            .then(resolver)
            .then(resolve)
            .catch(reject);
    });
}