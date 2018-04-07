const paipu = require('paipu');
const validateTravisPayload = require('./validate-travis-payload.pipe');

module.exports = paipu.pipeIf(
  true,
  'travis payload validation',
  validateTravisPayload,
);
