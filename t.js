const request = require('request');
const logger = console;

const jobId = 295503515;


const resolver = (log, params, comment) => {

}
const stripAnsi = require('strip-ansi');

const comment = console.log;


request(`https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`, (err, response, log) => {
    if (err) return reject(err);

    logger.log(`Resolving log... (length: ${log.length})`);

    let mochaLog = stripAnsi(log);
    
    mochaLog = mochaLog.substr(mochaLog.indexOf('> mocha'));
    
    mochaLog = mochaLog.substr(mochaLog.indexOf('\n'));

    mochaLog = mochaLog.substr(0, mochaLog.indexOf('npm ERR!')).trim();

    mochaLog = mochaLog
            .replace('✓', '<span color="green">✓</span>');

    comment({
        contents: mochaLog,
    });
});