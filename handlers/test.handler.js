const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

module.exports = (language, jobId) => {
  logger.log(`Testing job '${jobId}' (${language})`);
  return new Promise((resolve, reject) => {
    utils.requestLog(jobId)
      .then(log => resolver(log, { language }))
      .then((log) => {
        const logs = [log];
        return messageFormatter.failure(logs, 'John Doe');        
      })
      .then(resolve)
      .catch(reject);
  });
};
