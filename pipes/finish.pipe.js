const logger = require('../utils/logger');

const finish = context => {
  context.pullRequestUrl = `https://github.com/${context.owner}/${
    context.repo
  }/pull/${context.pullRequest}#issuecomment-${context.commentId}`;

  const endTime = new Date().getTime();

  logger.log(
    `Successfuly created comment`,
    {
      pullRequestUrl: context.pullRequestUrl,
      commentContents: context.message,
      startTime: context.startTime,
      endTime,
      totalTime: endTime - context.startTime,
    },
    context,
  );

  return context;
};

module.exports = finish;
