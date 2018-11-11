const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const createComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubToken,
  });

  const onlyOption = context.query.only;
  if (onlyOption && onlyOption.split(',').includes(context.state) === false) {
    logger.log(`Skipping comment because only option forbids it`);
    context.onlyOptionSkippedComment = true;
    return context;
  }

  const issues = gh.getIssues(context.owner, context.repo);

  const commentResult = await issues.createIssueComment(
    context.pullRequest,
    context.message,
  );

  context.commentId = commentResult.data.id;

  logger.log(
    'Comment created',
    { commentId: context.commentId, commentContents: context.message },
    context,
  );

  return context;
};

module.exports = createComment;
