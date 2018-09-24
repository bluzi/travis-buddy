const logger = require('../utils/logger');

const wait = async context => {
  if (context.meta.delay) {
    await (ms => new Promise(resolve => setTimeout(resolve, ms)))(
      context.meta.delay,
    );

    logger.log(
      `Waited for ${context.meta.delay}ms`,
      { waitTimeMs: context.meta.delay },
      context,
    );
  } else {
    logger.log('No wait time', { waitTimeMs: 0 }, context);
  }

  return context;
};

module.exports = wait;
