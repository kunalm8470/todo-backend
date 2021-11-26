const Ajv = require('ajv').default;
const { StatusCodes } = require('http-status-codes');
const { DuplicateItemError, InvalidObjectIdError, ItemNotFoundError, PaginationParameterError, PathNotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const UnhandledErrorMiddleware = (err, req, res, next) => {
    logger.error('Server exception - %s', err);

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let type = 'Server error';
    let details;

    if (err instanceof DuplicateItemError) {
        statusCode = StatusCodes.CONFLICT;
        type = 'Duplicate error';
    } else if (err instanceof InvalidObjectIdError) {
        statusCode = StatusCodes.BAD_REQUEST;
        type = 'Invalid id error';
    } else if (err instanceof ItemNotFoundError) {
        statusCode = StatusCodes.NOT_FOUND;
        type = 'Item not found error';
    } else if (err instanceof PaginationParameterError) {
        statusCode = StatusCodes.BAD_REQUEST;
        type = 'Invalid pagination parameter error';
    } else if (err instanceof PathNotFoundError) {
        statusCode = StatusCodes.NOT_FOUND;
        type = 'Path not found error';
    } else if (err instanceof Ajv.ValidationError && err.errors) {
        statusCode = StatusCodes.BAD_REQUEST;
        type = 'Schema validation error';

        details = err.errors.map((schemaError) => ({
            instancePath: schemaError.instancePath,
            params: schemaError.params,
            message: schemaError.message
        }));
    }

    const error = {
        type,
        error: err.message
    };

    if (details) {
        error.details = details;
    }

    return res.status(statusCode).json(error);
};

module.exports = UnhandledErrorMiddleware;
