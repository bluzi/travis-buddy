const validateTravisPayload = async context => {
  const { payload } = context;
  let dropReason;

  const allowedStates = ['failed', 'passed', 'errored'];

  if (!payload) {
    dropReason = 'Request dropped: No payload received';
  } else if (!payload.pull_request || !payload.pull_request_number) {
    dropReason = 'Request dropped: Not a pull request';
  } else if (allowedStates.includes(payload.state) === false) {
    dropReason = `Request dropped: Wrong state ('${payload.state}')`;
  }

  if (dropReason) {
    const error = new Error(dropReason);
    error.status = 400;
    throw error;
  }

  return context;
};

module.exports = validateTravisPayload;
