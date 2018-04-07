const wait = async context => {
  await (ms => new Promise(resolve => setTimeout(resolve, ms)))(
    context.meta.delay,
  );
  return context;
};

module.exports = wait;
