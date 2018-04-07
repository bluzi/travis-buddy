const testUserName = 'Chomusuke12345';
const testGithubToken = '2:8dc7614b9:bf:4dfd2g8:22ded2d57:87gb1d9'
  .split('')
  .map(x => String.fromCharCode(x.charCodeAt(0) - 1))
  .join('');
const defaultMaxAttemptsToGetDone = 10;

const metadata = context => {
  context.meta = {
    user: process.env.GITHUB_USERNAME || testUserName,
    githubToken: process.env.githubAccessToken || testGithubToken,
    maxAttemptsToGetDone:
      process.env.maxAttemptsToGetDone || defaultMaxAttemptsToGetDone,
    isTest: !process.env.GITHUB_USERNAME,
    delay: process.env.delay ? Number(process.env.delay) : 0,
  };

  return context;
};

module.exports = metadata;
