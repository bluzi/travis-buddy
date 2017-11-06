const GitHub = require('github-api');
const utils = require('../utils/utils');
const logger = require('../utils/logger');
const messageFormatter = require('../utils/message-formatter');


module.exports = (data) => {
    return new Promise((resolve, reject) => {
        const gh = new GitHub({
            token: utils.getGithubAccessToken(),
        });
    
        const contents = messageFormatter.success(data.author);
        logger.log(`Attempting to create success comment in PR`, data);
    
        const issues = gh.getIssues(data.owner, data.repo);    
        issues.createIssueComment(data.pullRequest, contents)
            .then(result => {
                data.commentContent = contents;
                logger.log(`Comment created successfuly`, data);
                resolve();
            })
            .catch(e => {
                logger.error(`Could not create comment`, data);
                logger.error(e.toString());
            });
    });
};