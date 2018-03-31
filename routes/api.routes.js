const express = require('express');
const failureHandler = require('../handlers/failure.handler');
const successHandler = require('../handlers/success.handler');
const errorHandler = require('../handlers/error.handler');
const utils = require('../utils/utils');
const database = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/status', (req, res) => {
  res.send({ state: 'running' });
});

router.post('/', async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  let data;

  database.logPayload(payload);

  try {
    data = await utils.getData(payload, req.params);
    logger.log('Received payload (and successfuly extracted data)', req.body);
  } catch (e) {
    logger.warn('Received payload (but failed to extract data)', req.body);
    throw e;
  }

  try {
    utils.starRepo(data.owner, data.repo);
  } catch (e) {
    logger.error('Could not star repisotiry');
    throw e;
  }

  let dropReason;
  if (!payload) {
    dropReason = 'Request dropped: No payload received';
  } else if (!payload.pull_request || !payload.pull_request_number) {
    dropReason = 'Request dropped: Not a pull request';
  } else if (
    payload.state !== 'failed' &&
    payload.state !== 'passed' &&
    payload.state !== 'errored'
  ) {
    dropReason = `Request dropped: Wrong state ('${payload.state}')`;
  }

  if (dropReason) {
    logger.warn(`Request dropped! Reason: '${dropReason}'`, data);
    return res
      .status(200)
      .send({ err: true, reason: dropReason })
      .end();
  }

  logger.log(
    `Handling request for '${data.pullRequestTitle}' by '${data.author}'`,
    data,
  );

  const handleRequest = {
    failed: failureHandler,
    passed: successHandler,
    errored: errorHandler,
  }[payload.state];

  data.successTemplate = req.query.successTemplate;
  data.failureTemplate = req.query.failureTemplate;
  data.errorTemplate = req.query.errorTemplate;

  const handlerResult = await handleRequest(data);

  logger.log('Finished', handlerResult);
  database.logComment(payload, handlerResult);

  return res
    .status(200)
    .send({ err: false })
    .end();
});

module.exports = router;
