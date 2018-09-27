const logger = require('../utils/logger');

const finish = context => {
  context.pullRequestUrl = `https://github.com/${context.owner}/${
    context.repo
  }/pull/${context.pullRequest}#issuecomment-${context.commentId}`;

  const endTime = new Date().getTime();

  logger.log(
    `Successfully created comment`,
    {
      pullRequestUrl: context.pullRequestUrl,
      commentContents: context.message,
      startTime: context.startTime,
      endTime,
      totalTime: endTime - context.startTime,
      templateContents: context.templateContents,
      travisType: context.travisType,
      state: context.state,
      query: context.query,
      pullRequestTitle: context.pullRequestTitle,
      pullRequestAuthor: context.pullRequestAuthor,
      author: context.author,
      pullRequest: context.pullRequest,
      link: context.link,
      language: context.language,
      insertMode: context.config.insertMode,
      commentId: context.commentId,
      buildNumber: context.buildNumber,
      payload: JSON.stringify(context.payload, null, 4),

      ...context.meta,
    },
    context,
  );

  return context;
};

module.exports = finish;
