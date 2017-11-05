const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');

module.exports = jobId => {
    logger.log(`Testing job '${jobId}'`);
    return new Promise((resolve, reject) => {
        utils.requestLog(jobId)
            .then(resolver)
            .then(message => {
                message.author = 'eliran';
                return utils.formatMessage(message);
            })
            .then(resolve)
            .catch(reject);
    });
}