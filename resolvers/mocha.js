const logger = require('./../logger');

module.exports = (log, params, comment) => {
    logger.log('mocha');
    log = log.substr(log.indexOf('> mocha'));
    logger.log(log);
    
    log = log.substr(log.indexOf('\n'));
    logger.log(log);

    log = log.substr(0, log.indexOf('npm ERR!')).trim();
    logger.log(log);

    log = log
            .replace('✓', '![alt text](https://raw.githubusercontent.com/bluzi/travis-buddy/master/resources/checkmark.png "Checkmark")');

    logger.log(log);

    comment({
        contents: log,
    });
}