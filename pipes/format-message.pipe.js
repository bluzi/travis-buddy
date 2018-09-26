const paipu = require('paipu');
const mustache = require('mustache');
const collectFailureData = require('./collect-failure-data.pipe');
const fetchTemplate = require('./fetch-template.pipe');
const logger = require('../utils/logger');

const formatMessage = async context => {
  context.message = mustache.render(context.templateContents, {
    author: context.author,
    pullRequestAuthor: context.pullRequestAuthor,
    jobs: context.jobs,
    link: context.link,
    requestId: context.requestId,
  });

  if (context.config.debug === true) {
    const debugData = JSON.stringify(context.payload, null, 4);
    context.message = `${context.message}\n\n#Debug Data\n${debugData}`;
  }

  try {
    logger.log(
      'Message formatted',
      {
        author: context.author,
        pullRequestAuthor: context.pullRequestAuthor,
        link: context.link,
        jobs: context.jobs.map(job => ({ ...job, scripts: undefined })),
        scripts: context.jobs.reduce(
          (scripts, job) => [
            ...scripts,
            ...(job.scripts && job.scripts.length > 0
              ? job.scripts.map(script => ({ ...script, jobId: job.id }))
              : []),
          ],
          [],
        ),
      },
      context,
    );
  } catch (e) {
    logger.error(e, context);
  }

  return context;
};

module.exports = paipu
  .pipeIf(
    context => context.state === 'failed',
    'collect failure data',
    collectFailureData,
  )
  .pipe('fetch template', fetchTemplate)
  .pipe('format message', formatMessage);
