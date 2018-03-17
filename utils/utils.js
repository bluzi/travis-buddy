const logger = require('./logger');
const request = require('request-promise-native');
const stripAnsi = require('strip-ansi');
const ordinal = require('ordinal');
const GitHub = require('github-api');


const MAX_ATTEMPTS_TO_GET_DONE = process.env.maxAttemptsToGetDone || 10;
logger.log(`Max attempts to get done is: ${MAX_ATTEMPTS_TO_GET_DONE}`);

module.exports.requestLog = async (jobId, data, attempts = 0) => {
  const options = {
    uri: `https://api.travis-ci.org/jobs/${jobId}/log.txt?deansi=true`,
    method: 'GET',
    resolveWithFullResponse: true,
  };
  const res = await request(options);
  const log = res.body;

  const lastLine = log.trim().split(/\r?\n/).pop();
  if (lastLine.startsWith('Done.') || attempts >= MAX_ATTEMPTS_TO_GET_DONE) {
    if (lastLine.startsWith('Done.')) {
      logger.log(`Done found after ${attempts}/${MAX_ATTEMPTS_TO_GET_DONE} attempts.`, data);
    } else {
      logger.log('Max attempts achived, giving up done');
    }

    const cleanLog = stripAnsi(log);
    return cleanLog;
  }

  logger.log(`Done not found, requesting new log... (${attempts}/${MAX_ATTEMPTS_TO_GET_DONE}`, data);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      module.exports.requestLog(jobId, data, attempts + 1).then(resolve).catch(reject);
    }, 1000);
  });
};

module.exports.getData = (payload, params) => ({
  params,

  owner: payload.repository.owner_name,
  repo: payload.repository.name,
  pullRequest: payload.pull_request_number,
  pullRequestTitle: payload.pull_request_title,
  buildNumber: payload.id,
  jobs: payload.matrix.filter(job => job.state === 'failed').map((job, index) => module.exports.createJobObject(job, index)),
  author: payload.author_name,
  state: payload.state,
  branch: payload.branch,
  travisType: payload.type,
  language: payload.config.language,
  scripts: payload.config.script,
});

module.exports.createJobObject = (job, index) => ({
  id: job.id,
  displayName: module.exports.getJobDisplayName(job, index),
});

module.exports.getJobDisplayName = (job, index) => {
  if (job.config.language === 'node_js') return `Node.js: ${job.config.node_js}`;

  return `${ordinal(index + 1)} Build`;
};

module.exports.getTestUserAccessToken = () =>
  '2:8dc7614b9:bf:4dfd2g8:22ded2d57:87gb1d9'
    .split('').map(x => String.fromCharCode(x.charCodeAt(0) - 1)).join('');

module.exports.getGithubAccessToken = () => {
  const githubAccessToken = process.env.githubAccessToken || ((args) => {
    const githubArg = args.find(arg => arg.startsWith('githubAccessToken='));
    if (githubArg) {
      return githubArg.replace('githubAccessToken=', '');
    }

    return module.exports.getTestUserAccessToken();
  })(process.argv);

  if (!githubAccessToken) throw new Error(`Invalid GitHub access token ${githubAccessToken}`);

  return githubAccessToken;
};

module.exports.getGithubApi = () => new GitHub({
  token: module.exports.getGithubAccessToken(),
});

module.exports.starRepo = (owner, repoName) => new Promise((resolve, reject) => {
  const gh = module.exports.getGithubApi();
  const repo = gh.getRepo(owner, repoName);

  repo.isStarred((err, isStarred) => {
    if (err) return reject(new Error('Error checking if repo is starred'));

    if (!isStarred) {
      return repo.star(starError => (starError ? reject(new Error('Error starring repository')) : resolve(true)));
    }

    return resolve(false);
  });
});
