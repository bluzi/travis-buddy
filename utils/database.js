const mongoose = require('mongoose');
const logger = require('./logger');

const environment = process.env.environment || 'unknown';

const timeStarted = new Date().getTime();

let logComment;
let logError;
let logPayload;

if (!process.env.MONGODB_URI) {
  logger.warn('Database logging is: OFF');

  const noop = () => {};
  logComment = noop;
  logError = noop;
  logPayload = noop;
} else {
  logger.log('Database logging is: ON');

  const CommentSchema = new mongoose.Schema({
    timestamp: Number,
    timeStarted: Number,
    environment: String,
    payload: Object,
    data: Object,
  });
  const CommentModel = mongoose.model('Comment', CommentSchema);

  const ErrorSchema = new mongoose.Schema({
    timestamp: Number,
    timeStarted: Number,
    environment: String,
    data: Object,
    error: String,
    stack: String,
  });
  const ErrorModel = mongoose.model('Error', ErrorSchema);

  const PayloadSchema = new mongoose.Schema({
    timestamp: Number,
    timeStarted: Number,
    environment: String,
    payload: Object,
  });
  const PayloadModel = mongoose.model('Payload', PayloadSchema);

  mongoose.connect(process.env.MONGODB_URI);
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;

  db.on('error', err => logger.error('MongoDB connection error', err));

  logComment = (payload, data) => CommentModel.create({
    timestamp: new Date().getTime(),
    timeStarted,
    environment,
    payload,
    data,
  });

  logPayload = payload => PayloadModel.create({
    timestamp: new Date().getTime(),
    timeStarted,
    environment,
    payload,
  });

  logError = (data, error) => ErrorModel.create({
    timestamp: new Date().getTime(),
    timeStarted,
    environment,
    data,
    error: error.message,
    stack: error.stack,
  });
}

module.exports = {
  logError,
  logComment,
  logPayload,
};
