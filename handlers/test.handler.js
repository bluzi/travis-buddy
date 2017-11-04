const logger = require('../utils/logger');
const resolver = require('../resolvers/node_js.resolver');
const utils = require('../utils/utils');

module.exports = jobId => {
    logger.log(`Testing job '${jobId}'`);
    return new Promise((resolve, reject) => {
        utils.requestLog(jobId)
            .then(resolver)
            .then(message => utils.formatMessage(message))
            .then(resolve)
            .catch(reject);
    });
}