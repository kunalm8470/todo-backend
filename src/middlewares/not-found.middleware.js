const { PathNotFoundError } = require('../utils/errors');

const NotFoundMiddleware = (req, res, next) => {
    return next(new PathNotFoundError(`Route not found with - ${req.originalUrl}`));
};

module.exports = NotFoundMiddleware;