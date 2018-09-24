const fs = require('fs');
const request = require('request-promise-native');
const logger = require('../utils/logger');

const getTemplate = async context => {
  const { owner, repo, branch, template } = context;

  const type = {
    passed: 'success',
    failed: 'failure',
    errored: 'error',
  }[context.state];

  let templatePath = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/travis-buddy-${type}-template.md`;

  const options = {
    uri: templatePath,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  try {
    const res = await request(options);
    context.templateContents = res.body;
  } catch (error) {
    templatePath = `resources/messages/${type}/${template ||
      'default'}.${type}.template.md`;
    context.templateContents = fs.readFileSync(templatePath, 'utf8');
  }

  logger.log(
    'Template',
    {
      templateContents: context.templateContents,
      templatePath,
      type,
    },
    context,
  );

  return context;
};

module.exports = getTemplate;
