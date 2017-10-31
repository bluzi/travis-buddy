const Logger = require('logdna');

const logger = Logger.createLogger(process.env.logdnaApiKey, {});

module.exports = logger;