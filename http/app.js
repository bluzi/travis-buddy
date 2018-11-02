const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const logger = require('../utils/logger');
const path = require('path');

const { createApiRoutes } = require('../routes/api.routes');
const { createWebsiteRoutes } = require('../routes/website.routes');
const { createGithubRoutes } = require('../routes/github-app.routes');

const createApp = options => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, '../public/views'));

  app.use('/public', express.static('public'));

  app.use('/', createApiRoutes(options));
  app.use('/', createWebsiteRoutes(options));
  app.use('/', createGithubRoutes(options));

  // catch 404 and forward to error handler
  app.use((req, res) => {
    res.status(404).render('not-found');
  });

  // Error handler
  app.use((error, req, res) => {
    logger.error(error.message, { error, body: req.body });

    // Render the error page
    res.status(error.status || 500);
    res.end();
  });

  return app;
};

module.exports = {
  createApp,
};
