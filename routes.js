const express = require('express');
const handle = require('./handler');
const fs = require('fs');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send({ state: 'running' });
});

router.post('/:mode', (req, res, next) => {
    console.log('\n\n!!! HANDLING NEW REQUEST !!!\n\n')
    const payload = JSON.parse(req.body.payload);

    fs.writeFileSync('payload.log', JSON.stringify(payload));

    if (!payload) {
        console.log('No payload received');
        return res.status(500).send('No payload recived').end();
    } else if (!payload.pull_request || !payload.pull_request_number) {
        console.log('Not a pull request');
        return res.status(500).send('Not a pull request').end();
    } else if (payload.state !== 'failed') {
        console.log(`State is not failed. (state: ${payload.state})`);
        return res.status(500).send(`State is not failed. (state: ${payload.state})`).end();
    }

    const owner = payload.repository.owner_name;
    const repo = payload.repository.name;
    const mode = req.params.mode;
    const pullRequest = payload.pull_request_number;
    const buildNumber = payload.id;
    const jobId = payload.matrix[0].id;
    const author = payload.author_name;

    const tolog = {
        owner,
        repo,
        mode,
        pullRequest,
        buildNumber,
    };

    fs.writeFileSync('travis-buddy.log', JSON.stringify(tolog, null, 4));

    console.log(tolog);

    handle(owner, repo, jobId, pullRequest, author, mode)
    .then(() => res.status(200).send({ ok: true }).end());
});

module.exports = router;
