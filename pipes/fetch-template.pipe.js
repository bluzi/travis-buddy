const fs = require('fs');
const request = require('request-promise-native');

const getTemplate = async context => {
  const { owner, repo, branch, template } = context;

  const type = {
    passed: 'success',
    failed: 'failure',
    errored: 'error',
  }[context.state];

  const options = {
    uri: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/travis-buddy-${type}-template.md`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  try {
    const res = await request(options);
    context.templateContents = res.body;
  } catch (error) {
    const templatePath = `resources/messages/${type}/${template ||
      'default'}.${type}.template.md`;
    context.templateContents = fs.readFileSync(templatePath, 'utf8');
  }

  return context;
};

module.exports = getTemplate;
