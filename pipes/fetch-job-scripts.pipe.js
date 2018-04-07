const defaultScripts = require('../resources/default-scripts.json');

const fetchJobScripts = async context => {
  let allScripts;

  context.jobs.forEach(job => {
    job.scripts = [];

    if (!context.scripts) {
      if (job.script) {
        allScripts = [job.script];
      } else {
        if (!defaultScripts[context.language]) {
          throw new Error(
            `Deafult script was not found for '${context.language}'`,
          );
        }

        allScripts = [defaultScripts[context.language]];
      }
    } else if (Array.isArray(context.scripts)) {
      allScripts = context.scripts;
    } else {
      allScripts = [context.scripts];
    }

    allScripts.forEach(script => {
      let scriptContents = job.log.substr(job.log.indexOf(script));
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
          const isDuplicate = job.scripts.some(
            scriptLog => scriptLog.contents === scriptContents,
          );

          if (!isDuplicate) {
            job.scripts.push({
              command: script,
              contents: scriptContents,
            });
          }
        }
      }
    });
  });

  context.jobs = context.jobs.filter(job => job.scripts.length > 0);

  return context;
};

module.exports = fetchJobScripts;
