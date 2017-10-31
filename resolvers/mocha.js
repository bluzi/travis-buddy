module.exports = (log, params, comment) => {
    log = log.substr(log.indexOf('> mocha'));
    
    log = log.substr(log.indexOf('\n'));

    log = log.substr(0, log.indexOf('npm ERR!')).trim();

    log = log
            .replace('✓', '<span color="green">✓</span>');

    comment({
        contents: log,
    });
}