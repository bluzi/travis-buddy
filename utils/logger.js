const Logger = require('logdna');
const os = require('os');
const ip = require('ip');
const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const logzIo = require('logzio-nodejs');

const env = process.env.environment || 'unknown';

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
  logdnaLogger = Logger.createLogger(process.env.logdnaApiKey, {
    env,
    hostname: os.hostname(),
    ip: ip.address(),
  });
}

function formatMessage(message, meta) {
  if (meta && meta.owner && meta.repo && meta.pullRequest) {
    return `${meta.owner}/${meta.repo} #${meta.pullRequest}: ${message}`;
  } else if (meta && meta.owner && meta.repo) {
    return `${meta.owner}/${meta.repo}: ${message}`;
  }
  return message;
}

module.exports.log = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.log(formatMessage(message, meta));
  }

  if (logzIoLogger) {
    logzIoLogger.log({
      type: 'log',
      message,
      ...meta,
    });
  }

  bunyanLogger.info(message);
};

module.exports.debug = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.debug(formatMessage(message, meta), { meta });
  }

  if (logzIoLogger) {
    logzIoLogger.log({
      type: 'debug',
      message,
      ...meta,
    });
  }

  bunyanLogger.debug(message, meta || '');
};

module.exports.error = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.error(formatMessage(message, meta), { meta });
  }

  if (logzIoLogger) {
    logzIoLogger.log({
      type: 'error',
      message,
      ...meta,
    });
  }

  bunyanLogger.error(message, meta || '');
};

module.exports.warn = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.warn(formatMessage(message, meta), { meta });
  }

  if (logzIoLogger) {
    logzIoLogger.log({
      type: 'warning',
      message,
      ...meta,
    });
  }

  bunyanLogger.warn(message);
};
