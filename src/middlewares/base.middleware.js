const { PaginationParameterError } = require('../utils/errors');

class BaseMiddleware {
    constructor() {
        this.validatePaginatedParameters = this.validatePaginatedParameters.bind(this);
    }

    validatePaginatedParameters(req, res, next) {
        let { page, limit } = req.query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        if (isNaN(page)) {
            req.query.page = 1;
        }

        if (isNaN(limit)) {
            req.query.limit = 10;
        }

        if (page < 0) {
            return next(new PaginationParameterError('Invalid pagination parameter - page'));
        }

        if (limit < 0) {
            return next(new PaginationParameterError('Invalid pagination parameter - limit'));
        }

        return next();
    }
}

module.exports = new BaseMiddleware();
