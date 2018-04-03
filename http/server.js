const http = require('http');
const app = require('./app');
const logger = require('../utils/logger');
const ip = require('ip');
const utils = require('../utils/utils');

const port = process.env.PORT || '3000';
const server = http.createServer(app);

server.on('listening', () =>
  logger.log(
    `Server is running on ${ip.address()}:${port} (environment: ${process.env
      .environment || 'unknown'}, user: ${utils.getUserName()})`,
  ),
);

server.on('error', error => logger.error('Server error', { error }));

server.listen(port);
