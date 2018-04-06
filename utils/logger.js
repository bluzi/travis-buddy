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

function commonLogger(logdnaType, bunyanType) {
  return (message, meta) => {
    if (bunyanType !== undefined && logdnaType !== undefined) {
      if (logdnaLogger) {
        logdnaLogger[logdnaType](formatMessage(message, meta), { meta });
      }
      const type = logdnaType === 'warn' ? 'warning' : logdnaType;
      if (logzIoLogger) {
        logzIoLogger.log({
          type: String(type),
          message,
          ...meta,
        });
      }

      bunyanLogger[bunyanType](message, meta || '');
    }
  };
}
const [log, warn, error, debug] = [
  commonLogger('log', 'info'),
  commonLogger('warn', 'warn'),
  commonLogger('error', 'error'),
  commonLogger('debug', 'debug'),
];

module.exports = {
  log,
  warn,
  error,
  debug,
};
