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

function formatMessage(message, meta) {
  if (meta && meta.owner && meta.repo && meta.pullRequest) {
    return `${meta.owner}/${meta.repo} #${meta.pullRequest}: ${message}`;
  } else if (meta && meta.owner && meta.repo) {
    return `${meta.owner}/${meta.repo}: ${message}`;
  }
  return message;
}

function commonLogger(options) {
  return (message, meta) => {
    if (logdnaLogger && options.logdna)
      logdnaLogger[options.logdna](formatMessage(message, meta), { meta });
    if (logzIoLogger && options.logzIo)
      logzIoLogger.log({ type: String(options.logzIo), message, ...meta });
    if (options.bunyan) bunyanLogger[options.bunyan](message);

    if (process.env.SENTRY_DSN) {
      if (meta && meta.error) {
        Sentry.captureException(meta.error);
      }

      Sentry.captureMessage(message);
    }
  };
}
const [log, warn, error, debug] = [
  commonLogger({
    logdna: 'log',
    bunyan: 'info',
    logzIo: 'log',
  }),

  commonLogger({
    logdna: 'warn',
    bunyan: 'warn',
    logzIo: 'warning',
  }),

  commonLogger({
    logdna: 'error',
    bunyan: 'error',
    logzIo: 'error',
  }),

  commonLogger({
    logdna: 'debug',
    bunyan: 'debug',
    logzIo: 'debug',
  }),
];

module.exports = {
  log,
  warn,
  error,
  debug,
};
