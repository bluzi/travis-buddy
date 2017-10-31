module.exports = (log, params, comment) => {
    let mochaLog = log
        .substr(log.indexOf('> mocha'))
        .substr(log.indexOf('\n') + 1)

    mochaLog = mochaLog.substr(0, mochaLog.indexOf('npm ERR!')).trim();

    comment({
        contents: mochaLog,
    });
}