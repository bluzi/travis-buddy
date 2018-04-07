const configuration = require('../utils/configuration');

const fetchConfiguration = async context => {
  context.config = await configuration(context.owner, context.repo);
  return context;
};

module.exports = fetchConfiguration;
