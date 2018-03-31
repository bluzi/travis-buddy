const defaultScripts = require('../resources/default-scripts.json');
const logger = require('../utils/logger');

module.exports = async (job, log, data) => {
  const scriptLogs = [];
  let allScripts;

  if (!data.scripts) {
    if (job.script) {
      allScripts = [job.script];
    } else {
      if (!defaultScripts[data.language]) {
        throw new Error(`Deafult script was not found for '${data.language}'`);
      }

      allScripts = [defaultScripts[data.language]];
    }
  } else if (Array.isArray(data.scripts)) {
    allScripts = data.scripts;
  } else {
    allScripts = [data.scripts];
  }

  allScripts.forEach(script => {
    let scriptContents = log.substr(log.indexOf(script));

    const exitCode = /exited\swith\s(\d+)/g.exec(scriptContents);
    if (!exitCode || Number(exitCode[1]) !== 0) {
      scriptContents = scriptContents
        .split('\n')
        .slice(1)
        .join('\n');

      if (scriptContents.indexOf('" exited with ') > 0) {
        scriptContents = scriptContents
          .substr(0, scriptContents.indexOf('" exited with '))
          .trim();

        scriptContents = scriptContents
          .split('\n')
          .slice(0, -1)
          .join('\n');
      }

      scriptContents = scriptContents.trim();

      if (scriptContents) {
        scriptLogs.push({
          command: script,
          contents: scriptContents,
        });
      }
    }

    if (exitCode) {
      logger.log(`Exit code for script '${script}' is: '${exitCode[1]}'`);
    } else {
      logger.warn(`Could not find exit code for script '${script}'`);
    }
  });

  return { ...job, scripts: scriptLogs };
};
