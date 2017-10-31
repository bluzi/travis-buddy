module.exports = (log, params, comment) => {
    log = log.substr(log.indexOf('> mocha'));
    log = log.substr(log.indexOf('\n'));
    log = log.substr(0, log.indexOf('npm ERR!')).trim();

    log = log
            .replace('✓', '![alt text](https://raw.githubusercontent.com/bluzi/travis-buddy/master/resources/checkmark.png "Checkmark")');

    comment({
        contents: log,
    });
}