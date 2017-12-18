const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

module.exports = data => new Promise((resolve, reject) => {
  const resolverPromises = data.jobs.map(job =>
    utils.requestLog(job.id, data)
      .then(log => resolver(job, log, data)));

  Promise.all(resolverPromises)
    .then((jobs) => {
      const gh = utils.getGithubApi();

      const contents = messageFormatter.failure(jobs, data.author);

      logger.log('Attempting to create failure comment in PR', data);

      const issues = gh.getIssues(data.owner, data.repo);
      issues.createIssueComment(data.pullRequest, contents)
        .then(() => {
          logger.log('Comment created successfuly', Object.assign({}, data, { commentContent: contents }));
          resolve();
        })
        .catch((e) => {
          logger.error('Could not create comment', data);
          logger.error(e.toString());
        });
    })
    .catch(reject)
    .then(() => utils.starRepo(data.owner, data.repo).catch(logger.error));
});

