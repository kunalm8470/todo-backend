const mongoose = require('mongoose');
const Todo = require('../models/todo.model');

class TodoService {
    constructor() {
        this.getAllTodos = this.getAllTodos.bind(this);
        this.getTodoById = this.getTodoById.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.updateTodo = this.updateTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.validateId = this.validateId.bind(this);
    }

    async getAllTodos(searchOptions, fullUrl) {
        const page = parseInt(searchOptions.page || 1, 10);
        const limit = parseInt(searchOptions.limit || 10, 10);
        const offset = (page - 1) * limit;
        const filter = Object.create(null);

        const todos = await Todo.find(filter).skip(offset).limit(limit);
        const todoCount = await Todo.estimatedDocumentCount();
        
        let pagedResponse = {
            pages: 0,
            first_page: '',
            last_page: '',
            prev_page: '',
            next_page: '',
            page_size: limit,
            total_count: todoCount,
            data: []
        };

        if (todoCount === 0) {
            return pagedResponse;
        }

        let queryParams = new URLSearchParams();
        
        const firstPageNo = 1;
        queryParams.set('page', firstPageNo);
        queryParams.set('limit', limit);
        const firstPageUrl = [fullUrl, '?', queryParams.toString()].join('');

        const lastPageNo = parseInt(Math.ceil(todoCount / limit), 10);
        queryParams.set('page', lastPageNo);
        queryParams.set('limit', limit);
        const lastPageUrl = [fullUrl, '?', queryParams.toString()].join('');

        const prevPageNo = (page > firstPageNo) ? page - 1 : firstPageNo;
        queryParams.set('page', prevPageNo);
        queryParams.set('limit', limit);
        const prevPageUrl = [fullUrl, '?', queryParams.toString()].join('');

        const nextPageNo = (page < lastPageNo) ? page + 1 : lastPageNo;
        queryParams.set('page', nextPageNo);
        queryParams.set('limit', limit);
        const nextPageUrl = [fullUrl, '?', queryParams.toString()].join('');

        pagedResponse = {
            pages: lastPageNo,
            first_page: firstPageUrl,
            last_page: lastPageUrl,
            prev_page: prevPageUrl,
            next_page: nextPageUrl,
            page_size: limit,
            total_count: todoCount,
            data: todos
        };

        return pagedResponse;
    }

    getTodoById(todoId) {
        const filter = {
            _id: mongoose.Types.ObjectId(todoId)
        };
        return Todo.findOne(filter);
    }

    addTodo(todoDto) {
        const todo = new Todo(todoDto);
        return todo.save();
    }

    updateTodo(todoDto) {
        const filter = {
            _id: mongoose.Types.ObjectId(todoDto.id)
        };
        const update = {
            title: todoDto.title,
            completed: todoDto.completed
        };
        const options = {
            new: true
        };
        return Todo.findOneAndUpdate(filter, update, options);
    }

    deleteTodo(todoId) {
        const filter = {
            _id: mongoose.Types.ObjectId(todoId)
        };
        return Todo.deleteOne(filter);
    }

    validateId(id) {
        return mongoose.Types.ObjectId.isValid(id);
    }
}

module.exports = new TodoService();
