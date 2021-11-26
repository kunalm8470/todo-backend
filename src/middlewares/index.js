const BaseMiddleware = require('./base.middleware');
const CorrelationIdMiddleware = require('./correlationid.middleware');
const NotFoundMiddleware = require('./not-found.middleware');
const UnhandledErrorMiddleware = require('./unhandled-error.middleware');
const ValidateTodoSchemaMiddleware = require('./todo-validation-schema.middleware');

module.exports = {
    BaseMiddleware,
    CorrelationIdMiddleware,
    NotFoundMiddleware,
    UnhandledErrorMiddleware,
    ValidateTodoSchemaMiddleware
};
