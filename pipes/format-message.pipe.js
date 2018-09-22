const paipu = require('paipu');
const mustache = require('mustache');
const collectFailureData = require('./collect-failure-data.pipe');
const fetchTemplate = require('./fetch-template.pipe');

const formatMessage = async context => {
  context.message = mustache.render(context.templateContents, {
    author: context.author,
    pullRequestAuthor: context.pullRequestAuthor,
    jobs: context.jobs,
    link: context.link,
  });

  return context;
};

module.exports = paipu
  .pipeIf(
    context => context.state === 'failed',
    'collect failure data',
    collectFailureData,
  )
  .pipe('fetch template', fetchTemplate)
  .pipe('format message', formatMessage);
