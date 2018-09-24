const request = require('request-promise-native');
const logger = require('../utils/logger');
const stripAnsi = require('strip-ansi');

const requestLog = async jobId => {
  const options = {
    uri: `https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  const res = await request(options);
  const log = res.body;

  return log;
};

const validateLog = log => {
  const lastLine = log
    .trim()
    .split(/\r?\n/)
    .pop();

  return lastLine.startsWith('Done.');
};

const doneFound = (attempts, maxAttempts, context) =>
  logger.log(
    `Done found after ${attempts}/${maxAttempts} attempts.`,
    { attempts, maxAttempts },
    context,
  );

const doneNotFound = (attempts, maxAttempts, context) =>
  logger.log(
    `Done not found, requesting new log... (${attempts}/${maxAttempts}`,
    { attempts, maxAttempts },
    context,
  );

const getLog = async (context, job) => {
  let attempts = 0;

  while (!job.log) {
    const log = await requestLog(job.id);
    const isValid = validateLog(log);

    if (isValid) {
      doneFound(attempts, context.meta.maxAttemptsToGetDone, context);
      job.log = stripAnsi(log);
      logger.log(
        `Found log for job #${job.id} ${job.displayName}`,
        job,
        context,
      );
    } else if (attempts >= context.meta.maxAttemptsToGetDone) {
      logger.log('Max attempts achived, giving up done');
      job.log = stripAnsi(log);
      logger.log(
        `Giving up on done for job #${job.id} ${job.displayName}`,
        job,
        context,
      );
    } else {
      doneNotFound(attempts, context.meta.maxAttemptsToGetDone, context);

      attempts += 1;
      await (ms => new Promise(resolve => setTimeout(resolve, ms)))(1000);
    }
  }
};

const fetchBuildsLogs = async context => {
  await Promise.all(context.jobs.map(job => getLog(context, job)));

  logger.log('Found all logs', context.jobs, context);

  return context;
};

module.exports = fetchBuildsLogs;
