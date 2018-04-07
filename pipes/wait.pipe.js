const wait = async context => {
  if (context.meta.delay) {
    await (ms => new Promise(resolve => setTimeout(resolve, ms)))(
      context.meta.delay,
    );
  }

  return context;
};

module.exports = wait;
