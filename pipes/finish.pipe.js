const logger = require('../utils/logger');

const finish = context => {
  context.pullRequestUrl = `https://github.com/${context.owner}/${
    context.repo
  }/pull/${context.pullRequest}#issuecomment-${context.commentId}`;

  logger.log(
    `Successfuly created comment`,
    {
      pullRequestUrl: context.pullRequestUrl,
      commentContents: context.message,
    },
    context,
  );

  return context;
};

module.exports = finish;
