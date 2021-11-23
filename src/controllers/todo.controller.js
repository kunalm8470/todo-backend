const { TodoService } = require('../services');
const { StatusCodes } = require('http-status-codes');

class TodoController {
    async get(req, res, next) {
        try {
            const pagedResponse = await TodoService.getAll(req.query);
            return res.status(StatusCodes.OK).json(pagedResponse);
        } catch (err) {
            return next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const todoItem = await TodoService.getById(req.params.id);
            return res.status(StatusCodes.OK).json(todoItem);
        } catch (err) {
            return next(err);
        }
    }

    async add(req, res, next) {
        try {
            const createdTodoItem = await TodoService.add(req.body);

            // Set location header to point to newly created resource
            const fullUrl = [req.protocol, '://', req.get('host'), req.baseUrl, req.path, createdTodoItem._id].join('');
            res.location(fullUrl);

            return res.status(StatusCodes.CREATED).json(createdTodoItem);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next) {
        try {
            await TodoService.update(req.body);
            return res.status(StatusCodes.OK).end();
        } catch (err) {
            return next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await TodoService.delete(req.params.id);
            return res.status(StatusCodes.NO_CONTENT).end();
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = new TodoController();
