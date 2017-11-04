const GitHub = require('github-api');
const resolvers = require('../resolvers/resolvers.json');
const path = require('path');
const logger = require('../utils/logger');
const utils = require('../utils/utils');

const githubAccessToken = process.env.githubAccessToken || (args => {
    const githubArg = args.find(arg => arg.startsWith('githubAccessToken='));
    if (githubArg) {
        return githubArg.replace('githubAccessToken=', '');
    }

    return null;
})(process.argv);

if (!githubAccessToken) throw new Error(`Invalid GitHub access token ${githubAccessToken}`);

logger.log(`Using GitHub token: ${githubAccessToken}`);

module.exports = (data) => {
    return new Promise((resolve, reject) => {

        if (!data.mode) data.mode = 'general';

        logger.log(`Looking for a resolver for mode '${data.mode}'`, data);

        const resolverMeta = resolvers.find(resolver => resolver.mode = data.mode);

        if (!resolverMeta) {
            return reject(`Unable to find resolver for '${data.mode}'`);
        }
        
        const resolver = require('../resolvers/' + resolverMeta.path);

        logger.log(`Resolver found in: '${resolverMeta.path}'`, data);

        utils.requestLog(data.jobId, data)
            .then(resolver)
            .then(message => {
                const gh = new GitHub({
                    token: process.env.githubAccessToken
                });

                message.author = data.author;
                const contents = utils.formatMessage(message);
                const issues = gh.getIssues(data.owner, data.repo);

                logger.log(`Attempting to create a comment in PR`, data);

                issues.createIssueComment(data.pullRequest, contents)
                    .then(result => {
                        data.commentContent = contents;
                        logger.log(`Comment created successfuly`, data);
                        resolve();
                    })
                    .catch(e => {
                        logger.error(`Could not create comment`, data);
                        logger.error(e.toString());
                    })
            })
            .catch(reject);
    });
}
