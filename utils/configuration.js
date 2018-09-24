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

  let config = {};
  let isDefault = false;
  let travisYml = '';

  try {
    const res = await request(options);
    travisYml = res.body;
    config = yaml.parse(travisYml);

    config = defaults(config.travisBuddy || {}, defaultConfig.travisBuddy);
  } catch (e) {
    isDefault = true;
    config = defaultConfig.travisBuddy;
  }

  return {
    selectedConfig: config,
    isDefault,
    travisYml,
    defaultConfigPath,
  };
};

module.exports = load;
