const GitHub = require('github-api');
const path = require('path');
const logger = require('../utils/logger');
const utils = require('../utils/utils');
const fs = require('fs');

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

        data.language = 'node_js';
        logger.log(`Looking for a resolver for '${data.language}'`, data);

        const resolverPath = `resolvers/${data.language}.resolver.js`;

        if (!fs.existsSync(resolverPath)) {
            return reject(`Unable to find resolver for '${data.language}' at '${resolverPath}'`);
        }
        
        const resolver = require('../' + resolverPath);

        logger.log(`Resolver found`, data);

        utils.requestLog(data.jobId, data)
            .then(log => resolver(log, data))
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
