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

  const contents = await messageFormatter.success(successTemplate, owner, repo, branch, author, pullRequestAuthor);

  logger.log('Attempting to create success comment in PR', data);
  const issues = gh.getIssues(owner, repo);

  try {
    await issues.createIssueComment(data.pullRequest, contents);
    logger.log('Comment created successfuly', Object.assign({}, data, { commentContent: contents }));
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
