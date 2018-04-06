const logger = require('./logger');
const request = require('request-promise-native');
const yaml = require('yamljs');

const load = async (owner, repo) => {
  const emptyConfig = { templates: {} };

  const options = {
    uri: `http://raw.githubusercontent.com/${owner}/${repo}/master/.travis.yml`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  try {
    const res = await request(options);
    const config = yaml.parse(res.body);

    // if travisBuddy node isn't present, append a blank version of it
    if (!config.travisBuddy) {
      config.travisBuddy = emptyConfig;
    }

    return config.travisBuddy;
  } catch (e) {
    logger.warn('No .travis.yml was present on the repository');
    return emptyConfig;
  }
};

module.exports = load;
