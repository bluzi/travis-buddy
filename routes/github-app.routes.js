const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/setup', async (req, res) => {
  logger.log('github auth', JSON.stringify(req.body));
  return res
    .status(200)
    .send(res.body)
    .end();
});

module.exports = router;
