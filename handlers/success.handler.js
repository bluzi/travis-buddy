const utils = require('../utils/utils');
const logger = require('../utils/logger');
const messageFormatter = require('../utils/message-formatter');

async function successHandler(data) {
  const gh = utils.getGithubApi();
  const {
    successTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  } = data;

  const contents = await messageFormatter.success(
    successTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  );

  logger.log('Attempting to create success comment in PR', data);
  const issues = gh.getIssues(owner, repo);

  try {
    const commentResult = await issues.createIssueComment(data.pullRequest, contents);
    const commentId = commentResult.data.id;

    const pullRequestUrl = `https://github.com/${owner}/${repo}/pull/${data.pullRequest}#issuecomment-${commentId}`;
    logger.log(`Comment created successfuly: ${pullRequestUrl}`, Object.assign({}, data, { commentContent: contents }));
  } catch (e) {
    logger.error('Could not create comment', data);
    logger.error(e.toString());
  }

  try {
    utils.starRepo(owner, repo);
  } catch (e) {
    logger.error(e);
  }
}

module.exports = successHandler;
