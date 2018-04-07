const editComment = require('./edit-comment.pipe');
const createComment = require('./create-comment.pipe');
const paipu = require('paipu');

const isEditable = context =>
  (context.query.insertMode || context.config.insertMode) === 'update' &&
  context.comments.some(comment => comment.user.login === context.meta.user);

module.exports = paipu.pipeIf(
  isEditable,
  'calculate insert mode',
  editComment,
  createComment,
);
