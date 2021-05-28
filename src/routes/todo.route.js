const express = require('express');
const TodoController = require('../controllers/todo.controller');

const router = express.Router();

router.get('/', TodoController.get);
router.get('/:id', TodoController.getById);
router.post('/', TodoController.add);
router.put('/', TodoController.update);
router.delete('/:id', TodoController.delete);

module.exports = router;