const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;

const ajv = new Ajv({
    allErrors: true
});
addFormats(ajv);

// Cache the schemas
ajv.addSchema(require('../utils/validators/schema/todo/create.json'), 'todo.create');
ajv.addSchema(require('../utils/validators/schema/todo/update.json'), 'todo.update');

const ValidateTodoSchemaMiddleware = (name) => {
    return async (req, res, next) => {
        try {
            const validate = ajv.getSchema(name);
            await validate(req.body);
            next();
        } catch(err) {
            return next(err);
        }
    };
};

module.exports = ValidateTodoSchemaMiddleware;
