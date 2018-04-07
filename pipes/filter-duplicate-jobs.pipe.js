const stringSimilarity = require('string-similarity');

const similarIndication = 0.9;

const filterDuplicateJobs = context => {
  if (context.jobs.length > 1) {
    Object.keys(context.jobs).forEach(key => {
      const job = context.jobs[key];
      const duplicates = context.jobs.filter(
        otherJob =>
          !otherJob.scripts.some(
            (script, index) =>
              stringSimilarity.compareTwoStrings(
                script.contents.replace(/[0-9]/g, ''),
                job.scripts[index].contents.replace(/[0-9]/g, ''),
              ) < similarIndication,
          ),
      );
      const isDuplicate = duplicates.length > 1;

      if (isDuplicate) {
        delete context.jobs[key];
      }
    });

    context.jobs = context.jobs.filter(job => job);
  }

  return context;
};

module.exports = filterDuplicateJobs;
