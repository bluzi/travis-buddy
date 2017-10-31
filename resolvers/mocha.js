const logger = require('./../logger');

module.exports = (log, params, comment) => {
    log = log.substr(log.indexOf('> mocha'));
    logger.log(log);
    
    log = log.substr(log.indexOf('\n'));
    logger.log(log);

    log = log.substr(0, log.indexOf('npm ERR!')).trim();
    logger.log(log);

    log = log
            .replace('✓', '<span color="green">✓</span>');

    logger.log(log);

    comment({
        contents: log,
    });
}