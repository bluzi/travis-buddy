const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

async function testHandler(language, jobId) {
  logger.log(`Testing job '${jobId}' (${language})`);

  let log = await utils.requestLog(jobId);
  log = resolver(log, { language });

  const logs = [log];

  return messageFormatter.failure(logs, 'John Doe');
}

module.exports = testHandler;
