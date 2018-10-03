const logger = require('../utils/logger');

const defaultScripts = require('../resources/default-scripts.json');

const getCommandFromJob = (job, language) => {
  let allScripts;
  if (Array.isArray(job.script)) {
    allScripts = job.script;
  } else if (job.script) {
    allScripts = [job.script];
  } else if (!defaultScripts[language]) {
    throw new Error(`Deafult script was not found for '${language}'`);
  } else {
    allScripts = [defaultScripts[language]];
  }

  return allScripts;
};

const getJobCommands = (context, job) => {
  let allScripts;
  if (!context.scripts) {
    allScripts = getCommandFromJob(job, context.language);
  } else if (Array.isArray(context.scripts)) {
    allScripts = context.scripts;
  } else {
    allScripts = [context.scripts];
  }

  return allScripts;
};

const cutScript = (scriptContents, script) => {
  scriptContents = scriptContents
    .split('\n')
    .slice(1)
    .join('\n');

  if (scriptContents.indexOf(`The command "${script}" exited with `) > 0) {
    scriptContents = scriptContents
      .substr(0, scriptContents.indexOf(`The command "${script}" exited with `))
      .trim();

    // scriptContents = scriptContents
    //   .split('\n')
    //   .slice(0, -1)
    //   .join('\n');
  }

  scriptContents = scriptContents.trim();

  return scriptContents;
};

const getJobScripts = async (context, job) => {
  job.scripts = [];

  const allScripts = getJobCommands(context, job);

  logger.log(`Found ${allScripts.length} scripts`, { allScripts }, context);

  let jobLog = job.log;

  allScripts.forEach(script => {
    script = script.trim();
    const initialJobLog = jobLog;
    let scriptContentsAfterCut = '';
    let scriptContentsAfterRegex = '';
    let isDuplicate = false;
    let hasProcessed = false;

    let scriptContents = jobLog.substr(jobLog.indexOf(script));
    const initialScriptContents = scriptContents;

    const exitCode = new RegExp(
      `The command "${script}" exited with (\\d+)`,
      'g',
    ).exec(scriptContents);

    const exitCodeFound = !!exitCode;

    jobLog = jobLog.substr(
      jobLog.indexOf(`The command "${script}" exited with `) + 1,
    );

    const resultedJobLog = jobLog;

    if (!exitCode || Number(exitCode[1]) !== 0) {
      scriptContents = cutScript(scriptContents, script);

      scriptContentsAfterCut = scriptContents;

      if (context.config.regex) {
        const regex = new RegExp(context.config.regex, context.config.regexOptions);
        const regexResult = regex.exec(scriptContents);
        // Retrieve the full strings of chars matched.
        if (regexResult && regexResult.length > 1) {
          scriptContents = regexResult[0];
        } else {
          scriptContents = undefined;
        }
      }

      scriptContentsAfterRegex = scriptContents;

      if (scriptContents) {
        isDuplicate = job.scripts.some(
          scriptLog => scriptLog.contents === scriptContents,
        );

        if (!isDuplicate) {
          hasProcessed = true;
          job.scripts.push({
            command: script,
            contents: scriptContents,
          });
        }
      }
    }

    logger.log(
      `Script ${script}`,
      {
        jobId: job,
        jobDisplayName: job.displayName,
        jobLink: job.link,
        jobLog: job.log,
        script,
        initialJobLog,
        exitCodeFound,
        exitCode: exitCode ? Number(exitCode[1]) : 0,
        initialScriptContents,
        resultedJobLog,
        scriptContentsAfterCut,
        regex: context.config.regex,
        scriptContentsAfterRegex,
        isDuplicate,
        hasProcessed,
      },
      context,
    );
  });

  return job;
};

const fetchJobScripts = async context => {
  context.jobs = await Promise.all(
    context.jobs.map(job => getJobScripts(context, job)),
  );

  context.jobs = context.jobs.filter(job => job.scripts.length > 0);

  logger.log(
    'Fetched scripts',
    {
      scripts: context.jobs.reduce(
        (scripts, job) => [
          ...scripts,
          ...job.scripts.map(script => ({ ...script, jobId: job.id })),
        ],
        [],
      ),
    },
    context,
  );

  return context;
};

module.exports = fetchJobScripts;
