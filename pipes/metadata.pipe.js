const logger = require('../utils/logger');

const defaultMaxAttemptsToGetDone = 10;

const metadata = context => {
  context.meta = {
    user: process.env.GITHUB_USERNAME,
    githubToken: process.env.githubAccessToken,
    maxAttemptsToGetDone:
      process.env.maxAttemptsToGetDone || defaultMaxAttemptsToGetDone,
    delay: process.env.delay ? Number(process.env.delay) : 0,
  };

  logger.log('Metadata created', metadata, context);

  return context;
};

module.exports = metadata;
