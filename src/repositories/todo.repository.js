const mongoose = require('mongoose');
const Todo = require('../models/todo.model');

class TodoRepository {
    async getAll(page, offset, limit) {
        const filter = Object.create(null);

        const todos = await Todo.find(filter).skip(offset).limit(limit);
        const todoCount = await Todo.estimatedDocumentCount().exec();
        
        let pagedResponse = {
            page: 0,
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

        const basePath = ['/api', '/v1', '/todo', '?'].join('');
        let queryParams = new URLSearchParams();
        
        const firstPageNo = 1;
        queryParams.set('page', firstPageNo);
        queryParams.set('limit', limit);
        const firstPageUrl = [basePath, queryParams.toString()].join('');

        const lastPageNo = parseInt(Math.ceil(todoCount / limit), 10);
        queryParams.set('page', lastPageNo);
        queryParams.set('limit', limit);
        const lastPageUrl = [basePath, queryParams.toString()].join('');

        const prevPageNo = (page > firstPageNo) ? page - 1 : firstPageNo;
        queryParams.set('page', prevPageNo);
        queryParams.set('limit', limit);
        const prevPageUrl = [basePath, queryParams.toString()].join('');

        const nextPageNo = (page < lastPageNo) ? page + 1 : lastPageNo;
        queryParams.set('page', nextPageNo);
        queryParams.set('limit', limit);
        const nextPageUrl = [basePath, queryParams.toString()].join('');

        pagedResponse = {
            page,
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

    getById(id) {
        return Todo.findById(id);
    }
  
    add(dto) {
        return Todo.create(dto);
    }

    update(dto) {
        const filter = {
            _id: mongoose.Types.ObjectId(dto.id)
        };
        const payload = {
            title: dto.title,
            description: dto.description,
            completed: dto.completed
        };

        return Todo.updateOne(filter, payload);
    }

    delete(id) {
        const filter = {
            _id: mongoose.Types.ObjectId(id)
        };
        return Todo.deleteOne(filter);
    }
}

module.exports = new TodoRepository();
