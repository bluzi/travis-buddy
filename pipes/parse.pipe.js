const paipu = require('paipu');
const parseTravisPayload = require('./parse-travis-payload.pipe');

module.exports = paipu.pipeIf(true, 'travis parser', parseTravisPayload);
// In the future, payloads from other CI providers will be parsed here
