const express = require('express');
const failureHandler = require('../handlers/failure.handler');
const successHandler = require('../handlers/success.handler');
const errorHandler = require('../handlers/error.handler');
const logger = require('../utils/logger');
const utils = require('../utils/utils');


const router = express.Router();

router.get('/status', (req, res) => {
  res.send({ state: 'running' });
});

router.post('/', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const data = await utils.getData(payload, req.params);

    let dropReason;
    if (!payload) {
      dropReason = 'Request dropped: No payload received';
    } else if (!payload.pull_request || !payload.pull_request_number) {
      dropReason = 'Request dropped: Not a pull request';
    } else if (payload.state !== 'failed' && payload.state !== 'passed' && payload.state !== 'errored') {
      dropReason = `Request dropped: Wrong state ('${payload.state}')`;
    }

    if (dropReason) {
      logger.warn(`Request dropped! Reason: '${dropReason}'`, data);
      return res.status(500).send({ err: true, reason: dropReason }).end();
    }

    logger.log(`Handling request for '${data.pullRequestTitle}' by '${data.author}'`, data);

    const handleRequest = ({
      failed: failureHandler,
      passed: successHandler,
      errored: errorHandler,
    })[payload.state];

    data.successTemplate = req.query.successTemplate;
    data.failureTemplate = req.query.failureTemplate;
    data.errorTemplate = req.query.errorTemplate;

    try {
      await handleRequest(data);
      return res.status(200).send({ err: false }).end();
    } catch (e) {
      logger.error('Error in handler', data);
      logger.error(e.toString(), data);
      return res.status(500).send({ err: true, reason: e.toString() }).end();
    }
  } catch (e) {
    logger.error('Error in routes', { error: e.message });
    return res.status(500).send({ err: true, reason: e.toString() }).end();
  }
});

module.exports = router;
