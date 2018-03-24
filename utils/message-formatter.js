const fs = require('fs');
const request = require('request-promise-native');
const logger = require('./logger');
const mustache = require('mustache');


async function getTemplate(owner, repo, branch) {
  const options = {
    uri: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/travis-buddy-failure-template.md`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  const res = await request(options);

  if (res.statusCode !== 200 && res.statusCode !== 201) {
    throw new Error(`HTTP Status ${res.statusCode}: ${res.statusMessage}`);
  }

  return res.body;
}


module.exports.failure = async (template, owner, repo, branch, jobs, author) => {
  let templateContents;
  try {
    templateContents = await getTemplate(owner, repo, branch);
  } catch (e) {
    logger.debug('Cannot find template file on GitHub', { owner, repo, branch });
    templateContents = fs.readFileSync(`resources/messages/failure/${template || 'default'}.failure.template.md`, 'utf8');
  }

  return mustache.render(templateContents, {
    jobs,
    author,
  });
};


module.exports.success = async (template, owner, repo, branch, author) => {
  const templateContents = await fs.readFile(`resources/messages/success/${template || 'default'}.success.template.md`, 'utf8');
  return mustache.render(templateContents, {
    author,
  });
};
