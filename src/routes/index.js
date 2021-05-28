const express = require('express');
const router = express.Router();

router.use('/todo', require('./todo.route'));

module.exports = router;