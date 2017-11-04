const express = require('express');
const handle = require('../handlers/api.handler');
const logger = require('../utils/logger');
const utils = require('../utils/utils');
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.send({ state: 'running' });
});

router.post('/', (req, res, next) => {
    try {
        const payload =  JSON.parse(req.body.payload);
        const data = utils.getData(payload, req.params);

        let dropReason;
        if (!payload) {
            dropReason = 'Request dropped: No payload received';
        } else if (!payload.pull_request || !payload.pull_request_number) {
            dropReason = 'Request dropped: Not a pull request';
        } else if (payload.state !== 'failed') {
            dropReason = 'Request dropped: State is not failed';
        }

        if (dropReason) {
            logger.warn(`Request dropped! Reason: '${dropReason}'`, data);
            return res.status(500).send({ err: true, reason: dropReason }).end();
        }

        logger.log(`Handling request for '${data.pullRequestTitle}' by '${data.author}'`, data);

        handle(data)
            .then(() => res.status(200).send({ err: false }).end())
            .catch(e => {
                logger.error('Error in handler', data);
                logger.error(e.toString(), data);
                res.status(500).send({ err: true, reason: e.toString() }).end();
            });
    } catch (e) {
        logger.error('Error in routes', { error: e.message });
        res.status(500).send({ err: true, reason: e.toString() }).end();
    }
});

module.exports = router;
