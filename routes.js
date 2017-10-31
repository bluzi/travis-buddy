const express = require('express');
const handle = require('./handler');
const logger = require('./logger');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.send({ state: 'running' });
});

router.post('/:mode', (req, res, next) => {
    logger.log('\n\n!!! HANDLING NEW REQUEST !!!\n\n')
    const payload = JSON.parse(req.body.payload);

    logger.log(payload);

    if (!payload) {
        logger.log('No payload received');
        return res.status(500).send('No payload recived').end();
    } else if (!payload.pull_request || !payload.pull_request_number) {
        logger.log('Not a pull request');
        return res.status(500).send('Not a pull request').end();
    } else if (payload.state !== 'failed') {
        logger.log(`State is not failed. (state: ${payload.state})`);
        return res.status(500).send(`State is not failed. (state: ${payload.state})`).end();
    }

    const owner = payload.repository.owner_name;
    const repo = payload.repository.name;
    const mode = req.params.mode;
    const pullRequest = payload.pull_request_number;
    const buildNumber = payload.id;
    const jobId = payload.matrix[0].id;
    const author = payload.author_name;

    logger.log({
        owner,
        repo,
        mode,
        pullRequest,
        buildNumber,
    });

    logger.log(tolog);

    handle(owner, repo, jobId, pullRequest, author, mode)
        .then(() => res.status(200).send({ ok: true }).end());
});

module.exports = router;
