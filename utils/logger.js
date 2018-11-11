const logdna = require('logdna');
const os = require('os');
const ip = require('ip');
const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const logzIo = require('logzio-nodejs');
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

const env = process.env.environment || 'unknown';

let logLevel = 0;

const prettyStdOut = new PrettyStream({
  mode: 'dev',
});
prettyStdOut.pipe(process.stdout);
const bunyanLogger = bunyan.createLogger({
  name: env,
  streams: [
    {
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut,
    },
  ],
});

let logzIoLogger;

if (process.env.logzIoAccessToken) {
  logzIoLogger = logzIo.createLogger({
    token: process.env.logzIoAccessToken,
    type: 'api',
  });
}

let logdnaLogger;
if (process.env.logdnaApiKey) {
  logdnaLogger = logdna.createLogger(process.env.logdnaApiKey, {
    env,
    hostname: os.hostname(),
    ip: ip.address(),
  });
}

function setLevel(level) {
  switch (level) {
    case 'all':
      logLevel = 1;
      break;

    case 'warnings':
      logLevel = 2;
      break;

    case 'errors':
      logLevel = 3;
      break;

    case 'nothing':
      logLevel = 0;
      break;

    default:
      throw new Error(`Unknown log level: ${level}`);
  }

  logLevel = level;
}

function formatMessage(message, context) {
  if (context && context.owner && context.repo && context.pullRequest) {
    message = `${context.owner}/${context.repo} #${
      context.pullRequest
    }: ${message}`;
  } else if (context && context.owner && context.repo) {
    message = `${context.owner}/${context.repo}: ${message}`;
  }

  if (context && context.currentPipe)
    message = `(${context.currentPipe}) ${message}`;

  return message;
}

function audit(pieceOfData, context) {
  if (logzIoLogger) {
    const timeSinceStart = context.startTime
      ? new Date().getTime() - context.startTime
      : -1;

    logzIoLogger.log({
      ...pieceOfData,
      requestId: context.requestId,
      repo: context.repo,
      owner: context.owner,
      repoFullName: `${context.owner}/${context.repo}`,
      timeSinceStart,
      pullRequest: context.pullRequest,
      branch: context.branch,
      pipe: context.currentPipe,
    });
  }
}

function log(message, extra, context) {
  if (!context) {
    context = extra || {};
    extra = {};
  }

  if (logdnaLogger) {
    logdnaLogger.log(formatMessage(message, context), extra);
  }

  if (logLevel === 1) {
    bunyanLogger.info(formatMessage(message, context));
  }

  audit({ logType: 'log', message, ...extra }, context);
}

function warn(message, extra, context) {
  if (!context) {
    context = extra || {};
    extra = {};
  }

  if (logdnaLogger) {
    logdnaLogger.warn(formatMessage(message, context), extra);
  }

  if (logLevel === 1 || logLevel === 2) {
    bunyanLogger.warn(formatMessage(message, context));
  }

  audit({ logType: 'warning', message, ...extra }, context);
}

function error(err, context) {
  if (!context) context = {};

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  if (logdnaLogger) {
    logdnaLogger.error(formatMessage(err.message, context), {
      stack: error.stack,
    });
  }

  if (logLevel !== 0) {
    bunyanLogger.error(formatMessage(err.message, context));
  }

  audit(
    {
      logType: 'error',
      message: err.message,
      stack: error.stack,
    },
    context,
  );
}

module.exports = {
  log,
  warn,
  error,
  audit,
  setLevel,
};
