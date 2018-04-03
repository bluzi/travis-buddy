const utils = require('../utils/utils');
const logger = require('../utils/logger');
const messageFormatter = require('../utils/message-formatter');

async function successHandler(data) {
  const {
    successTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  } = data;

  const commentContent = await messageFormatter.success(
    successTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  );

  logger.log('Attempting to create success comment in PR', data);

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
    const result = Object.assign({}, data, { commentContent, pullRequestUrl });

    logger.log(`Comment created successfuly: ${pullRequestUrl}`, result);

    return result;
  } catch (error) {
    logger.error('Could not create comment', { data, error });
    throw error;
  }
}

module.exports = successHandler;
