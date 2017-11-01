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
} else {
    logger = console;
}

function formatMessage(message, meta) {
    if (meta && meta.owner && meta.repo && meta.pullRequest) {
        return `${meta.owner}/${meta.repo} #${meta.pullRequest}: ${message}`;
    } else if (meta && meta.owner && meta.repo) {
        return `${meta.owner}/${meta.repo}: ${message}`;
    } else {
        return message;
    }
}

module.exports.log = (message, meta) => logger.log(formatMessage(message, meta), { meta });
module.exports.debug = (message, meta) => logger.debug(formatMessage(message, meta), { meta });
module.exports.error = (message, meta) => logger.error(formatMessage(message, meta), { meta });
module.exports.warn = (message, meta) => logger.warn(formatMessage(message, meta), { meta });