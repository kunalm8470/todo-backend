const BaseMiddleware = require('./base.middleware');
const NotFoundMiddleware = require('./not-found.middleware');
const UnhandledErrorMiddleware = require('./unhandled-error.middleware');
const ValidateTodoSchemaMiddleware = require('./todo-validation-schema.middleware');

module.exports = {
    BaseMiddleware,
    NotFoundMiddleware,
    UnhandledErrorMiddleware,
    ValidateTodoSchemaMiddleware
};
