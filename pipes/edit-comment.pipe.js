const GitHub = require('better-github-api');
const logger = require('../utils/logger');

const editComment = async context => {
  const gh = new GitHub({
    token: context.meta.githubToken,
  });

  const issues = gh.getIssues(context.owner, context.repo);

  const travisBuddysComment = context.comments.find(
    comment => comment.user.login === context.meta.user,
  );

  context.commentId = travisBuddysComment.id;

  await issues.editIssueComment(context.commentId, context.message);

  logger.log('Comment edited', context);

  return context;
};

module.exports = editComment;
