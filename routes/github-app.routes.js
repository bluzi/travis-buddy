const express = require('express');
const logger = require('../utils/logger');

const createGithubRoutes = () => {
  const router = express.Router();

  router.post('/setup', async (req, res) => {
    logger.log('github auth', JSON.stringify(req.body));
    return res
      .status(200)
      .send(res.body)
      .end();
  });

  return router;
};

module.exports = {
  createGithubRoutes,
};
