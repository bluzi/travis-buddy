const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');

async function failureHandler(data) {
  const gh = utils.getGithubApi();
  const {
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
    failureTemplate
  } = data;

  const resolverPromises = data.jobs.map(async job => {
    const log = await utils.requestLog(job.id, data);
    return resolver(job, log, data);
  });

  const jobs = await Promise.all(resolverPromises);
  const commentContent = await messageFormatter.failure(
    failureTemplate,
    owner,
    repo,
    branch,
    jobs,
    author,
    pullRequestAuthor
  );

  logger.log('Attempting to create failure comment in PR', data);
  const issues = gh.getIssues(data.owner, data.repo);

  try {
    const commentResult = await issues.createIssueComment(
      data.pullRequest,
      commentContent
    );
    const commentId = commentResult.data.id;

    const pullRequestUrl = `https://github.com/${owner}/${repo}/pull/${
      data.pullRequest
    }#issuecomment-${commentId}`;
    const result = Object.assign({}, data, { commentContent, pullRequestUrl });

    logger.log(`Comment created successfuly: ${pullRequestUrl}`, result);

    return result;
  } catch (e) {
    logger.error('Could not create comment');
    throw e;
  }
}

module.exports = failureHandler;
