const fs = require('fs');
const request = require('request');
const logger = require('./logger');
const mustache = require('mustache');


function getTemplate(owner, repo, branch) {
  const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/travis-buddy-failure-template.md`;
  return new Promise((resolve, reject) =>
    request(githubUrl, (err, res) => {
      if (err) return reject(err);
      if (res.statusCode !== 200 && res.statusCode !== 201) {
        return reject(new Error(`HTTP Status ${res.statusCode}: ${res.statusMessage}`));
      }

      return resolve(res.body);
    }));
}


module.exports.failure = async (template, owner, repo, branch, jobs, author) =>
  getTemplate(owner, repo, branch)
    .catch(() => {
      logger.debug('Cannot find template file on GitHub', { owner, repo, branch });
      return fs.readFileSync(`resources/messages/failure/${template || 'default'}.failure.template.md`, 'utf8');
    })
    .then(templateContents => mustache.render(templateContents, {
      jobs,
      author,
    }));

module.exports.success = async (template, owner, repo, branch, author) => {
  const templateContents = fs.readFileSync(`resources/messages/success/${template || 'default'}.success.template.md`, 'utf8');
  return mustache.render(templateContents, {
    author,
  });
};
