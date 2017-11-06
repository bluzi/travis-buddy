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
    } else {
        return message;
    }
}

module.exports.log =
    (message, meta) => (
        console.log(formatMessage(message, meta)),
        logger && logger.log(formatMessage(message, meta), { meta })
    );

module.exports.debug =
    (message, meta) => (
        console.debug(formatMessage(message)),
        logger && logger.debug(formatMessage(message, meta), { meta })
    );

module.exports.error =
    (message, meta) => (
        console.error(formatMessage(message), meta),
        logger && logger.error(formatMessage(message, meta), { meta })
    );

module.exports.warn =
    (message, meta) => (
        module.exports.verboseMode && console.warn(formatMessage(message)),
        logger && logger.warn(formatMessage(message, meta), { meta })
    );