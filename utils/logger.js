const Logger = require('logdna');
const os = require('os');
const ip = require('ip');
const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const env = process.env.environment || 'unknown';

const prettyStdOut = new PrettyStream({
  mode: 'dev'
});
prettyStdOut.pipe(process.stdout);
const bunyanLogger = bunyan.createLogger({
  name: env,
  streams: [
    {
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut
    }
  ]
});

let logdnaLogger;
if (process.env.logdnaApiKey) {
  logdnaLogger = Logger.createLogger(process.env.logdnaApiKey, {
    env,
    hostname: os.hostname(),
    ip: ip.address()
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
    logdnaLogger.log(formatMessage(message, meta), { meta });
  }
  bunyanLogger.info(message);
};

module.exports.debug = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.debug(formatMessage(message, meta), { meta });
  }
  bunyanLogger.debug(message, meta || '');
};

module.exports.error = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.error(formatMessage(message, meta), { meta });
  }
  bunyanLogger.error(message, meta || '');
};

module.exports.warn = (message, meta) => {
  if (logdnaLogger) {
    logdnaLogger.warn(formatMessage(message, meta), { meta });
  }

  bunyanLogger.warn(message);
};
