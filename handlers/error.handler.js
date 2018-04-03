const utils = require('../utils/utils');
const logger = require('../utils/logger');
const messageFormatter = require('../utils/message-formatter');

async function errorHandler(data) {
  const {
    errorTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  } = data;

  const commentContent = await messageFormatter.error(
    errorTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  );

  logger.log('Attempting to create error comment in PR', data);

  try {
    const commentId = await utils.createComment(
      owner,
      repo,
      data.pullRequest,
      commentContent,
      data.insertMode,
      data.comments,
    );

    const pullRequestUrl = `https://github.com/${owner}/${repo}/pull/${
      data.pullRequest
    }#issuecomment-${commentId}`;
    logger.log(
      `Comment created successfuly: ${pullRequestUrl}`,
      Object.assign({}, data, { commentContent }),
    );
  } catch (error) {
    logger.error('Could not create comment', { data, error });
    throw error;
  }

  try {
    utils.starRepo(owner, repo);
  } catch (e) {
    logger.error(e);
  }
}

module.exports = errorHandler;
