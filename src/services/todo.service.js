const { TodoRepository } = require('../repositories');
const { mongooseHelpers: { isValidObjectId } } = require('../utils');
const { InvalidObjectIdError, ItemNotFoundError, DuplicateItemError } = require('../utils/errors');

class TodoService {
    getAll(searchOptions) {
        const page = parseInt(searchOptions.page || 1, 10);
        const limit = parseInt(searchOptions.limit || 10, 10);
        const offset = (page - 1) * limit;

        return TodoRepository.getAll(page, offset, limit);
    }

    async getById(id) {
        if (!isValidObjectId(id)) {
            throw new InvalidObjectIdError();
        }

        const found = await TodoRepository.getById(id);

        if (!found) {
            throw new ItemNotFoundError(`Todo item not found with id - ${id}`);
        }

        return found;
    }

    async add(dto) {
        try {
            return await TodoRepository.add(dto);
        } catch(err) {
            if (err.code && err.code === 11000) {
                throw new DuplicateItemError();
            }

            throw err;
        }
    }

    async update(dto) {
        if (!isValidObjectId(dto.id)) {
            throw new InvalidObjectIdError();
        }

        const updateResult = await TodoRepository.update(dto);

        if (updateResult.matchedCount === 0) {
            throw new ItemNotFoundError(`Todo item not found with id - ${dto.id}`);
        }
    }

    async delete(id) {
        if (!isValidObjectId(id)) {
            throw new InvalidObjectIdError();
        }

        const deleteResult = await TodoRepository.delete(id);

        if (deleteResult.deletedCount === 0) {
            throw new ItemNotFoundError(`Todo item not found with id - ${id}`);
        }
    }
}

module.exports = new TodoService();
