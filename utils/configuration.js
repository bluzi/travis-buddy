const logger = require('./logger');
const request = require('request-promise-native');
const yaml = require('yamljs');
const defaults = require('defaults');
const fs = require('fs');

const load = async (owner, repo, branch) => {
  const options = {
    uri: `http://raw.githubusercontent.com/${owner}/${repo}/${branch}/.travis.yml`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  const defaultConfigPath = `resources/default-config.yml`;
  const defaultConfigFile = fs.readFileSync(defaultConfigPath, 'utf8');
  const defaultConfig = yaml.parse(defaultConfigFile);

  try {
    const res = await request(options);
    let config = yaml.parse(res.body);

    config = defaults(config.travisBuddy || {}, defaultConfig.travisBuddy);

    return config;
  } catch (e) {
    logger.warn('No .travis.yml was present on the repository');
    return defaultConfig.travisBuddy;
  }
};

module.exports = load;
