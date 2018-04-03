const logger = require('./logger');
const request = require('request-promise-native');
const stripAnsi = require('strip-ansi');
const ordinal = require('ordinal');
const GitHub = require('better-github-api');

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

  const lastLine = log
    .trim()
    .split(/\r?\n/)
    .pop();
  if (lastLine.startsWith('Done.') || attempts >= MAX_ATTEMPTS_TO_GET_DONE) {
    if (lastLine.startsWith('Done.')) {
      logger.log(
        `Done found after ${attempts}/${MAX_ATTEMPTS_TO_GET_DONE} attempts.`,
        data,
      );
    } else {
      logger.log('Max attempts achived, giving up done');
    }

    const cleanLog = stripAnsi(log);
    return cleanLog;
  }

  logger.log(
    `Done not found, requesting new log... (${attempts}/${MAX_ATTEMPTS_TO_GET_DONE}`,
    data,
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      module.exports
        .requestLog(jobId, data, attempts + 1)
        .then(resolve)
        .catch(reject);
    }, 1000);
  });
};

module.exports.getData = async (payload, params) => ({
  params,

  owner: payload.repository.owner_name,
  repo: payload.repository.name,
  pullRequest: payload.pull_request_number,
  pullRequestTitle: payload.pull_request_title,
  buildNumber: payload.id,
  author: payload.author_name,
  state: payload.state,
  branch: payload.branch,
  travisType: payload.type,
  language: payload.config.language,
  scripts: payload.config.script,

  jobs: payload.matrix
    .filter(job => job.state === 'failed')
    .map((job, index) => module.exports.createJobObject(job, index)),

  comments:
    (await module.exports.getAllComments(
      payload.repository.owner_name,
      payload.repository.name,
      payload.pull_request_number,
    )) || [],

  pullRequestAuthor:
    (await module.exports.getPullRequestAuthor(
      payload.repository.owner_name,
      payload.repository.name,
      payload.pull_request_number,
    )) || payload.author_name,
});

module.exports.getPullRequestAuthor = async (owner, repo, pullRequestNumber) =>
  new Promise((resolve, reject) => {
    const github = module.exports.getGithubApi();
    github
      .getRepo(owner, repo)
      .getPullRequest(pullRequestNumber, (err, pullRequest) => {
        if (err) return reject(err);
        return resolve(pullRequest.user.login);
      })
      .catch(() =>
        logger.warn(
          `Could not find author in: ${owner}/${repo} #${pullRequestNumber}`,
          {
            owner,
            repo,
            pullRequestNumber,
          },
        ),
      );
  });

module.exports.createJobObject = (job, index) => ({
  id: job.id,
  displayName: module.exports.getJobDisplayName(job, index),
  script: job.config.script,
});

module.exports.getJobDisplayName = (job, index) => {
  if (job.config.language === 'node_js')
    return `Node.js: ${job.config.node_js}`;
  else if (job.config.language === 'ruby') return `Ruby: ${job.config.rvm}`;

  return `${ordinal(index + 1)} Build`;
};

module.exports.getTestUserAccessToken = () =>
  '2:8dc7614b9:bf:4dfd2g8:22ded2d57:87gb1d9'
    .split('')
    .map(x => String.fromCharCode(x.charCodeAt(0) - 1))
    .join('');

module.exports.getGithubAccessToken = () => {
  const githubAccessToken =
    process.env.githubAccessToken ||
    (args => {
      const githubArg = args.find(arg => arg.startsWith('githubAccessToken='));
      if (githubArg) {
        return githubArg.replace('githubAccessToken=', '');
      }

      return module.exports.getTestUserAccessToken();
    })(process.argv);

  if (!githubAccessToken)
    throw new Error(`Invalid GitHub access token ${githubAccessToken}`);

  return githubAccessToken;
};

module.exports.getGithubApi = () =>
  new GitHub({
    token: module.exports.getGithubAccessToken(),
  });

module.exports.starRepo = (owner, repoName) =>
  new Promise((resolve, reject) => {
    const gh = module.exports.getGithubApi();
    const repo = gh.getRepo(owner, repoName);

    repo.isStarred((err, isStarred) => {
      if (err) return reject(new Error('Error checking if repo is starred'));

      if (!isStarred) {
        return repo.star(
          starError =>
            starError
              ? reject(new Error('Error starring repository'))
              : resolve(true),
        );
      }

      return resolve(false);
    });
  });

module.exports.createComment = async (
  owner,
  repo,
  pullRequestNumber,
  contents,
  insertMode,
  comments,
) => {
  const gh = module.exports.getGithubApi();
  const issues = gh.getIssues(owner, repo);

  if (insertMode === 'update') {
    const travisBuddysComment = comments.find(
      comment => comment.user.login === module.exports.getUserName(),
    );

    if (travisBuddysComment) {
      logger.log(`Editing comment ${travisBuddysComment.id}`);
      await issues.editIssueComment(travisBuddysComment.id, contents);

      return travisBuddysComment.id;
    }
  }

  const commentResult = await issues.createIssueComment(
    pullRequestNumber,
    contents,
  );

  return commentResult ? commentResult.data.id : false;
};

module.exports.getUserName = () =>
  process.env.GITHUB_USERNAME || 'Chomusuke12345';

module.exports.isTest = () => !process.env.GITHUB_USERNAME;

module.exports.getAllComments = async (owner, repo, pullRequestNumber) => {
  const gh = module.exports.getGithubApi();
  const issues = gh.getIssues(owner, repo);
  const comments = [];
  let page = 1;
  let bulk;

  do {
    bulk = await issues.listIssueComments(pullRequestNumber, {
      page,
    });

    comments.push(...bulk.data);

    if (module.exports.isTest()) return comments;

    page += 1;
  } while (bulk.data.length > 0);

  return comments;
};

module.exports.wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports.getStopComment = async comments => {
  const stopComment = comments.find(comment =>
    comment.body
      .toLowerCase()
      .includes(`@${module.exports.getUserName()} Stop`.toLowerCase()),
  );

  if (stopComment) return stopComment;

  return false;
};
