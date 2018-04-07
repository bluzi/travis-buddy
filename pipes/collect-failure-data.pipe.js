const paipu = require('paipu');
const fetchBuildLogs = require('./fetch-build-logs.pipe');
const filterDuplicateJobs = require('./filter-duplicate-jobs.pipe');
const fetchJobScripts = require('./fetch-job-scripts.pipe');

module.exports = paipu
  .pipe('fetch build logs', fetchBuildLogs)
  .pipe('fetch job scripts', fetchJobScripts)
  .pipe('filter out duplicate jobs', filterDuplicateJobs);
