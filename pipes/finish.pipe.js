const logger = require('../utils/logger');

const finish = context => {
  context.pullRequestUrl = `https://github.com/${context.owner}/${
    context.repo
  }/pull/${context.pullRequest}#issuecomment-${context.commentId}`;

  logger.log(`Successfuly created comment: ${context.pullRequestUrl}`, context);

  return context;
};

module.exports = finish;
