const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const { connect, options } = require('./src/config');
const { CorrelationIdMiddleware, NotFoundMiddleware, UnhandledErrorMiddleware } = require('./src/middlewares');
const logger = require('./src/utils/logger');

const app = express();

app.use(express.json());
app.use(CorrelationIdMiddleware);
app.use(cors());
app.use(compression());
app.use(helmet());

app.use(require('./src/routes'));

app.use(NotFoundMiddleware);
app.use(UnhandledErrorMiddleware);

if (process.env.NODE_ENV !== 'test') {
    connect(options.mongo.connectionString)
    .then((conn) => app.listen(options.port))
    .catch((err) => {
        logger.error(err, (error, level, message, meta) => {
            process.exit(1);
        });
    });
}

module.exports = {
    app
};
