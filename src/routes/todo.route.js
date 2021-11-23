const express = require('express');
const router = express.Router();

const { TodoController } = require('../controllers');
const { BaseMiddleware, ValidateTodoSchemaMiddleware } = require('../middlewares');

router.get('/', BaseMiddleware.validatePaginatedParameters, (req, res, next) => TodoController.get(req, res, next));
router.get('/:id', (req, res, next) => TodoController.getById(req, res, next));
router.post('/', ValidateTodoSchemaMiddleware('todo.create'), (req, res, next) => TodoController.add(req, res, next));
router.put('/', ValidateTodoSchemaMiddleware('todo.update'), (req, res, next) => TodoController.update(req, res, next));
router.delete('/:id', (req, res, next) => TodoController.delete(req, res, next));

module.exports = router;
