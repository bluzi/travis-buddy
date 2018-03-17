const GitHub = require('github-api');
const utils = require('./utils');
const request = require('request-promise-native');
const YAML = require('yamljs');
const detectIndent = require('detect-indent');
const logger = require('./logger');

const gh = new GitHub({
  token: utils.getGithubAccessToken(),
});

const repo = {
  owner: '',
  name: '',
  branch: 'master',
};

const pr = {
  title: 'TravisBuddy Integration',
  commitMessage: 'TravisBuddy Integration :zap:',
  body: `Hello!
  
  I'm TravisBuddy, and I'd like to help out by telling your contributors what's wrong when they create a PR that breaks the tests.
  Here are few examples of what I do: 
  1. https://github.com/bluzi/static-server/pull/1
  2. https://github.com/bluzi/name-db/pull/469
  
  Feel free to [visit my website](https://www.travisbuddy.com/) or [view my code on GitHub](https://github.com/bluzi/travis-buddy).
  
  If you want me to comment on PRs in this repository, all you have to do is to merge this PR, and if you don't - just close it. :) 
  
  If you have any questions, feel free to comment on this PR, and I'll answer. 

  Thanks,
  TravisBuddy :green_heart:`,
};

async function pullRequest() {
  const options = {
    uri: `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.branch}/.travis.yml`,
    method: 'GET',
    resolveWithFullResponse: true,
  };

  const res = await request(options);
  const travisConf = res.body;

  if (!res.body) {
    throw new Error('.trvais.yml does not exist in the repository');
  }

  const travisYaml = YAML.parse(travisConf);
  const repository = gh.getRepo(repo.owner, repo.name);
  const indent = detectIndent(travisConf);

  if (!travisYaml) throw new Error('Could not parse travis configuration');

  if (!travisYaml.notifications) {
    travisYaml.notifications = {};
  }
  if (!travisYaml.notifications.webhooks) {
    travisYaml.notifications.webhooks = {
      urls: [],
      on_success: 'never',
      on_failure: 'always',
      on_start: 'never',
      on_cancel: 'never',
      on_error: 'never',
    };
  }
  if (typeof travisYaml.notifications.webhooks === 'string') {
    travisYaml.notifications.webhooks = {
      urls: [travisYaml.notifications.webhooks],
      on_failure: 'always',
    };
  }

  travisYaml.notifications.webhooks.urls.push('https://www.travisbuddy.com/');

  await repository.fork();

  const fork = gh.getRepo('travisbuddy', repo.name);
  await fork.writeFile(repo.branch, '.travis.yml', YAML.stringify(travisYaml, 100, indent.amount || 2), pr.commitMessage, {});
  await repository.createPullRequest({
    title: pr.title,
    body: pr.body,
    head: `travisbuddy:${repo.branch}`,
    base: repo.branch,
    maintainer_can_modify: true,
  });
  logger.log('done');
}

pullRequest();
