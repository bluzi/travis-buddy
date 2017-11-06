const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');

module.exports = (language, buildNumber) => {
    logger.log(`Testing job '${jobId}' (${language})`);
    return new Promise((resolve, reject) => {
        utils.requestLog(jobId)
            .then(log => resolver(log, { language }))
            .then(message => {
                messages = [message];
                return utils.formatMessage(messages, 'John Doe');
            })
            .then(resolve)
            .catch(reject);
    });
}