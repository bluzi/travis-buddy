const http = require('http');
const { createApp } = require('./app');
const logger = require('../utils/logger');
const ip = require('ip');

const app = createApp({ isTest: false });

const port = process.env.PORT || '3000';
const server = http.createServer(app);

server.on('listening', () =>
  logger.log(
    `Server is running on ${ip.address()}:${port} (environment: ${process.env
      .environment || 'unknown'})`,
  ),
);

server.on('error', error => logger.error('Server error', { error }));

server.listen(port);
