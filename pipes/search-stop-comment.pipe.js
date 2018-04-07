const searchStopComment = context => {
  const stopComment = context.comments.find(comment =>
    comment.body
      .toLowerCase()
      .includes(`@${context.meta.user} Stop`.toLowerCase()),
  );

  if (stopComment) {
    const error = new Error(
      `Stop comment found (Commented by ${stopComment.user.login} at ${
        stopComment.updated_at
      })`,
    );

    error.status = 200;
    throw error;
  }

  return context;
};

module.exports = searchStopComment;
