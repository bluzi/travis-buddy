const express = require('express');
const handle = require('./handler');
const logger = require('./logger');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.send({ state: 'running' });
});

router.get('/test/:jobId', (req, res, next) => {
    const test = require('./test-log');

    test(req.params.jobId).then(log => {
        res
            .status(200)
            .send(`<pre>${log.contents}</pre>`)
            .end();
    });
});

router.post('/:mode', (req, res, next) => {
    try {
        const payload = JSON.parse(req.body.payload);

        if (!payload) {
            logger.warn('Request dropped: No payload received');
            return res.status(500).end();
        } else if (!payload.pull_request || !payload.pull_request_number) {
            logger.warn('Request dropped: Not a pull request');
            return res.status(500).send().end();
        } else if (payload.state !== 'failed') {
            logger.warn(`Request dropped: State is not failed. (state: ${payload.state})`);
            return res.status(500).send().end();
        }

        const owner = payload.repository.owner_name;
        const repo = payload.repository.name;
        const mode = req.params.mode;
        const pullRequest = payload.pull_request_number;
        const pullRequestTitle = payload.pull_request_title;
        const buildNumber = payload.id;
        const jobId = payload.matrix[0].id;
        const author = payload.author_name;


        logger.log(`#${pullRequest}: Handling request for '${pullRequestTitle}' by '${author}' in '${owner}/${repo}' (mode: '${mocha}', jobId: '${jobId}', build number: ${buildNumber})`, {
            meta: {
                owner,
                repo,
                mode,
                pullRequest,
                pullRequestTitle,
                buildNumber,
                jobId,
                author,
            }
        });

        handle(owner, repo, jobId, pullRequest, author, mode)
            .then(() => res.status(200).send({ ok: true }).end())
            .catch(e => {
                logger.error(log)
                res.status(500).end();
            });
    } catch (e) {
        logger.error('Error in routes', e);
        res.status(500).end();
    }
});

module.exports = router;
