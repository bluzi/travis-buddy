const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');

module.exports = (language, jobId) => {
    logger.log(`Testing job '${jobId}' (${language})`);
    return new Promise((resolve, reject) => {
        utils.requestLog(jobId)
            .then(log => resolver(log, { language }))
            .then(message => {
                message.author = 'eliran';
                return utils.formatMessage(message);
            })
            .then(resolve)
            .catch(reject);
    });
}