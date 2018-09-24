const logger = require('../utils/logger');

const configuration = require('../utils/configuration');

const fetchConfiguration = async context => {
  const config = await configuration(
    context.owner,
    context.repo,
    context.branch,
  );

  context.config = config.selectedConfig;

  if (config.isDefault) {
    logger.warn('No .travis.yml was present on the repository', context);
  }

  logger.log('Selected config', config.selectedConfig, context);
  logger.log('travis.yml', config.travisYml, context);

  return context;
};

module.exports = fetchConfiguration;
