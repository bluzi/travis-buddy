const configuration = require('../utils/configuration');

const fetchConfiguration = async context => {
  context.config = await configuration(
    context.owner,
    context.repo,
    context.branch,
  );
  return context;
};

module.exports = fetchConfiguration;
