const request = require('request');
const logger = console;

const jobId = 295502225;


const resolver = (log, params, comment) => {

}
const stripAnsi = require('strip-ansi');

const comment = console.log;


request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
    if (err) return reject(err);

    logger.log(`Resolving log... (length: ${log.length})`);

    log = stripAnsi(log);
    let mochaLog = log
        .substr(log.indexOf('> mocha'))
        .substr(log.indexOf('\n') + 1)

    mochaLog = mochaLog.substr(0, mochaLog.indexOf('npm ERR!')).trim();

    mochaLog = mochaLog
            .replace('✓', '<span color="green">✓</span>');

    comment({
        contents: mochaLog,
    });
});