const fs = require('fs');
const request = require('request-promise-native');
const logger = require('./logger');
const mustache = require('mustache');

async function getTemplate(owner, repo, branch, type) {
  const options = {
    uri: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/travis-buddy-${type}-template.md`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  const res = await request(options);

  if (res.statusCode !== 200 && res.statusCode !== 201) {
    throw new Error(`HTTP Status ${res.statusCode}: ${res.statusMessage}`);
  }

  return res.body;
}

module.exports.failure = async (
  template,
  owner,
  repo,
  branch,
  jobs,
  author,
  pullRequestAuthor,
) => {
  let templateContents;
  try {
    templateContents = await getTemplate(owner, repo, branch, 'failure');
  } catch (e) {
    logger.debug('Cannot find template file on GitHub', {
      owner,
      repo,
      branch,
    });
    templateContents = fs.readFileSync(
      `resources/messages/failure/${template || 'default'}.failure.template.md`,
      'utf8',
    );
  }

  return mustache.render(templateContents, {
    jobs,
    author,
    pullRequestAuthor,
  });
};

module.exports.success = async (
  template,
  owner,
  repo,
  branch,
  author,
  pullRequestAuthor,
) => {
  let templateContents;
  try {
    templateContents = await getTemplate(owner, repo, branch, 'success');
  } catch (e) {
    logger.debug('Cannot find template file on GitHub', {
      owner,
      repo,
      branch,
    });
    templateContents = fs.readFileSync(
      `resources/messages/success/${template || 'default'}.success.template.md`,
      'utf8',
    );
  }

  return mustache.render(templateContents, {
    author,
    pullRequestAuthor,
  });
};

module.exports.error = async (template, owner, repo, branch, author, pullRequestAuthor) => {
  let templateContents;
  try {
    templateContents = await getTemplate(owner, repo, branch, 'error');
  } catch (e) {
    logger.debug('Cannot find template file on GitHub', { owner, repo, branch });
    templateContents = fs.readFileSync(`resources/messages/error/${template || 'default'}.error.template.md`, 'utf8');
  }

  return mustache.render(templateContents, {
    author,
    pullRequestAuthor,
  });
};
