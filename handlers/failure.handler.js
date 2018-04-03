const logger = require('../utils/logger');
const utils = require('../utils/utils');
const resolver = require('../resolvers/simple.resolver');
const messageFormatter = require('../utils/message-formatter');
const stringSimilarity = require('string-similarity');

async function failureHandler(data) {
  const {
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
    failureTemplate,
  } = data;

  const resolverPromises = data.jobs.map(async job => {
    const log = await utils.requestLog(job.id, data);
    return resolver(job, log, data);
  });

  let jobs = await Promise.all(resolverPromises);

  if (jobs.length > 1) {
    Object.keys(jobs).forEach(key => {
      const job = jobs[key];
      const duplicates = jobs.filter(
        otherJob =>
          !otherJob.scripts.some(
            (script, index) =>
              stringSimilarity.compareTwoStrings(
                script.contents.replace(/[0-9]/g, ''),
                job.scripts[index].contents.replace(/[0-9]/g, ''),
              ) < 0.9,
          ),
      );
      const isDuplicate = duplicates.length > 1;

      if (isDuplicate) {
        delete jobs[key];
      }
    });

    jobs = jobs.filter(job => job);
  }

  if (!jobs || jobs.length === 0) {
    throw new Error('Could not resolve build log!');
  }

  const commentContent = await messageFormatter.failure(
    failureTemplate,
    owner,
    repo,
    branch,
    jobs,
    author,
    pullRequestAuthor,
  );

  logger.log('Attempting to create failure comment in PR', data);

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

module.exports = failureHandler;
