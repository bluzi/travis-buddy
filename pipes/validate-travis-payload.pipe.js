const logger = require('../utils/logger');

const validateTravisPayload = async context => {
  const { payload, requestId } = context;
  let dropReason;

  logger.log(
    `Validating payload`,
    {
      payload,
      requestId,
    },
    context,
  );

  const allowedStates = ['failed', 'passed', 'errored'];

  if (!payload) {
    dropReason = 'Request dropped: No payload received';
  } else if (!payload.pull_request || !payload.pull_request_number) {
    dropReason = 'Request dropped: Not a pull request';
  } else if (allowedStates.includes(payload.state) === false) {
    dropReason = `Request dropped: Wrong state ('${payload.state}')`;
  }

  if (dropReason) {
    logger.log(
      'Dropped request',
      {
        requestId,
        dropReason,
        state: payload.state,
      },
      context,
    );

    const error = new Error(dropReason);
    error.status = 400;
    throw error;
  }

  return context;
};

module.exports = validateTravisPayload;
