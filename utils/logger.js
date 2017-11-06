const Logger = require('logdna');
const os = require('os');
const ip = require('ip');

let logger;
if (process.env.logdnaApiKey) {
  logger = Logger.createLogger(process.env.logdnaApiKey, {
    env: process.env.environment || 'unknown',
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

module.exports.log =
    (message, meta) => logger && logger.log(formatMessage(message, meta), { meta });

module.exports.debug =
    (message, meta) => logger && logger.debug(formatMessage(message, meta), { meta });

module.exports.error =
    (message, meta) => logger && logger.error(formatMessage(message, meta), { meta });

module.exports.warn =
    (message, meta) => logger && logger.warn(formatMessage(message, meta), { meta });
