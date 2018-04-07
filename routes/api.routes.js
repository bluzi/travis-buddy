const express = require('express');
const paipu = require('paipu');
const logger = require('../utils/logger');

const validation = require('../pipes/validation.pipe');
const wait = require('../pipes/wait.pipe');
const parse = require('../pipes/parse.pipe');
const metadata = require('../pipes/metadata.pipe');
const star = require('../pipes/star.pipe');
const fetchConfiguration = require('../pipes/fetch-configuration.pipe');
const searchStopComment = require('../pipes/search-stop-comment.pipe');
const formatMessage = require('../pipes/format-message.pipe');
const publish = require('../pipes/publish.pipe');
const finish = require('../pipes/finish.pipe');

const router = express.Router();

router.get('/status', (req, res) => {
  res.send({ state: 'running' });
});

router.post('/', async (req, res) =>
  paipu
    .pipe('load payload', {
      payload: JSON.parse(req.body.payload),
      query: req.query,
    })
    .pipe('validate payload', validation)
    .pipe('get metadata', metadata)
    .pipe('wait', wait)
    .pipe('parse payload', parse)
    .pipe('star repo', star)
    .pipe('fetch configuration', fetchConfiguration)
    .pipe('search for a stop comment', searchStopComment)
    .pipe('format message', formatMessage)
    .pipe('publish', publish)
    .pipe('finish', finish)
    .afterPipe((context, pipe) => logger.log(`Pipe ${pipe} finished`))
    .resolve()
    .then(() => ({
      ok: true,
      status: 201,
    }))
    .catch(error => {
      logger.error(error);

      return {
        ok: false,
        error: error.message,
        status: error.status,
      };
    })
    .then(result => res.status(result.status || 500).send(result)),
);

module.exports = router;
