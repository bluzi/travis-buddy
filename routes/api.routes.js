const express = require('express');
const failureHandler = require('../handlers/failure.handler');
const successHandler = require('../handlers/success.handler');
const errorHandler = require('../handlers/error.handler');
const utils = require('../utils/utils');
const database = require('../utils/database');
const logger = require('../utils/logger');
const configuration = require('../utils/configuration');

const router = express.Router();

router.get('/status', (req, res) => {
  res.send({ state: 'running' });
});

router.post('/', async (req, res) => {
  if (process.env.delay && Number(process.env.delay)) {
    await utils.wait(Number(process.env.delay));
  }

  const payload = JSON.parse(req.body.payload);
  let data;

  database.logPayload(payload);

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

  try {
    data = await utils.getData(payload, req.params);
    logger.log('Received payload (and successfuly extracted data)', {
      payload,
    });
  } catch (error) {
    logger.warn('Received payload (but failed to extract data)', {
      payload,
      error,
    });

    return res
      .status(200)
      .send({ err: true, reason: 'Failed to extract data' })
      .end();
  }

  try {
    utils.starRepo(data.owner, data.repo);
  } catch (e) {
    logger.error('Could not star repisotiry');
    throw e;
  }

  const authors = data.comments
    .map(comment => comment.user.login)
    .filter((value, index, self) => self.indexOf(value) === index)
    .join(', ');

  logger.log(
    `Found ${
      data.comments.length
    } comments, from those the following authors: ${authors}`,
    data,
  );

  const stopComment = await utils.getStopComment(data.comments);

  if (stopComment) {
    logger.warn(
      `Dropping request because stop comment found (Commented by ${
        stopComment.user.login
      } at ${stopComment.updated_at})`,
    );

    return res
      .status(200)
      .send({ err: true, reason: 'Found stop comment' })
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

  const config = await configuration(data.owner, data.repo);

  data.successTemplate = config.templates.success || req.query.successTemplate;
  data.failureTemplate = config.templates.failure || req.query.failureTemplate;
  data.errorTemplate = req.query.errorTemplate;
  data.insertMode = config.insertMode || req.query.insertMode || 'append';

  const handlerResult = await handleRequest(data);

  logger.log('Finished', handlerResult);
  database.logComment(payload, handlerResult);

  return res
    .status(200)
    .send({ err: false })
    .end();
});

module.exports = router;
