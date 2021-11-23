const express = require('express');
const { StatusCodes } = require('http-status-codes');
const router = express.Router();

router.get('/', (req, res) => res.status(StatusCodes.OK).json({ message: 'Todo server' }));
router.get('/ping', (req, res) => res.status(StatusCodes.OK).json({ message: 'Pong' }));
router.use('/api/v1/todo', require('./todo.route'));

module.exports = router;
