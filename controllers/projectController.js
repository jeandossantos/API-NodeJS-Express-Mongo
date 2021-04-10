const express = require('express');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, resp) => {
    resp.send({ok: true})
});

module.exports = app => app.use('/projects', router);
