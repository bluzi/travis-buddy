const express = require('express');
const handle = require('../handlers/test.handler');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/:language/:jobId', (req, res, next) => {
    handle(route.params.language, req.params.jobId)
        .then(log => {
            res
                .status(200)
                .send(`<pre>${log}</pre>`)
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

module.exports = router;
