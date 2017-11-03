const express = require('express');
const handle = require('./handler');
const logger = require('./logger');
const utils = require('./utils');
const fs = require('fs');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.send({ state: 'running' });
});

router.get('/test/:jobId', (req, res, next) => {
    const test = require('./test-log');

    test(req.params.jobId)
        .then(log => {
            res
                .status(200)
                .send(`<pre>${log.contents}</pre>`)
                .end();
        })
        .catch(e => {
            logger.error('Error in tests', { error: e.message });
            res
                .status(500)
                .send(e.toString())
                .end();
        });
});

router.post('/:mode?', (req, res, next) => {
    debugger;
    try {
        fs.writeFileSync('t.json', JSON.stringify(req.body, null, 4));
        const payload =  JSON.parse(req.body.payload);
        const data = utils.getData(payload, req.params.mode);

        let dropReason;
        if (!payload) {
            dropReason = 'Request dropped: No payload received';
        } else if (!payload.pull_request || !payload.pull_request_number) {
            dropReason = 'Request dropped: Not a pull request';
        } else if (payload.state !== 'failed') {
            dropReason = 'Request dropped: State is not failed';
        }

        if (dropReason) {
            logger.warn(`Request dropped! Reason:\n'${dropReason}'`, data);
            return res.status(500).send().end();
        }

        logger.log(`Handling request for '${data.pullRequestTitle}' by '${data.author}'`, data);

        handle(data)
            .then(() => res.status(200).send({ ok: true }).end())
            .catch(e => {
                logger.error('Error in handler', data);
                logger.error(e.toString(), data);
                res.status(500).end();
            });
    } catch (e) {
        logger.error('Error in routes', { error: e.message });
        res.status(500).send(e.toString()).end();
    }
});

module.exports = router;
