const TodoService = require('../services/todo.service');
const { StatusCodes } = require('http-status-codes');

class TodoController {
    constructor() {
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async get(req, res, next) {
        try {
            const searchParams = Object.assign(Object.create(null), req.query);
            if (!searchParams.page || !searchParams.limit) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Page / Limit missing in the query string'
                });
            }

            const fullUrl = [req.protocol, '://', req.get('host'), req.baseUrl, req.path].join('');
            const pagedResponse = await TodoService.getAllTodos(searchParams, fullUrl);

            res.set({
                'X-Pagination-Per-Page': searchParams.limit,
                'X-Pagination-Current-Page': searchParams.page,
                'X-Pagination-Total-Pages': pagedResponse.pages,
                'X-Pagination-Total-Entries': pagedResponse.total_count
            });

            return res.status(StatusCodes.OK).json(pagedResponse);
        } catch (err) {
            return next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const todoId = req.params.id;
            if (!TodoService.validateId(todoId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Invalid Id'
                });
            }

            const todoItem = await TodoService.getTodoById(todoId);
            if (!todoItem) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'NOT_FOUND',
                    error_description: `Todo item with Id - ${todoId} not found!`
                });
            }

            return res.status(StatusCodes.OK).json(todoItem);
        } catch (err) {
            return next(err);
        }
    }

    async add(req, res, next) {
        try {
            if (!req.body || !req.body.title) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Invalid request body / title missing'
                });
            }

            const requestBody = Object.assign(Object.create(null), req.body);
            const createdTodoItem = await TodoService.addTodo(requestBody);
            const fullUrl = [req.protocol, '://', req.get('host'), req.baseUrl, req.path, createdTodoItem._id].join('');
            res.location(fullUrl);

            return res.status(StatusCodes.CREATED).json(createdTodoItem);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next) {
        try {
            if (!req.body || !req.body.title) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Invalid request body / title missing'
                });
            }

            if (!req.body.id || !TodoService.validateId(req.body.id)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Invalid Id / Id missing'
                });
            }

            if (typeof req.body.completed === 'undefined') {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Completed field missing'
                });
            }

            const requestBody = Object.assign(Object.create(null), req.body);
            const updateTodoItem = await TodoService.updateTodo(requestBody);

            if (!updateTodoItem) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'NOT_FOUND',
                    error_description: `Todo item with Id - ${requestBody.id} not found!`
                });
            }

            return res.status(StatusCodes.OK).json(updateTodoItem);
        } catch (err) {
            return next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const todoId = req.params.id;
            if (!TodoService.validateId(todoId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'BAD_REQUEST',
                    error_description: 'Invalid Id'
                });
            }
            
            const deleteResult = await TodoService.deleteTodo(todoId);
            return res.status(StatusCodes.OK).json(deleteResult);
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = new TodoController();