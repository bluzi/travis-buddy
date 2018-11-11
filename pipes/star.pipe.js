const logger = require('../utils/logger');
const GitHub = require('better-github-api');

const star = async context => {
  if (!context.meta.githubToken) {
    logger.warn('No GitHub token, unable to star repo');
    return context;
  }

  const gh = new GitHub({
    token: context.meta.githubToken,
  });
  const repo = gh.getRepo(context.owner, context.repo);

  try {
    const isStarred = await repo.isStarred();
    if (!isStarred) {
      await repo.star();
      logger.log('Repository starred', context);
    }
  } catch (error) {
    logger.warn(
      `Unable to star repository because: '${error.message}'`,
      context,
    );
  }

  return context;
};

module.exports = star;
