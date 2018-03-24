const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

async function failureHandler(data) {
  const gh = utils.getGithubApi();
  const {
    owner, repo, branch, author, failureTemplate,
  } = data;

  const resolverPromises = data.jobs.map(async (job) => {
    const log = await utils.requestLog(job.id, data);
    return resolver(job, log, data);
  });

  const jobs = await Promise.all(resolverPromises);
  const contents =
    await messageFormatter.failure(failureTemplate, owner, repo, branch, jobs, author);

  logger.log('Attempting to create failure comment in PR', data);
  const issues = gh.getIssues(data.owner, data.repo);

  try {
    await issues.createIssueComment(data.pullRequest, contents);
    logger.log('Comment created successfuly', Object.assign({}, data, { commentContent: contents }));
    return;
  } catch (e) {
    logger.error('Could not create comment', data);
    logger.error(e.toString());
  }

  try {
    await utils.starRepo(data.owner, data.repo);
  } catch (e) {
    logger.error(e);
  }
}

module.exports = failureHandler;

