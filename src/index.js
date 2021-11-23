const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const { connect, options } = require('./config');
const { NotFoundMiddleware, UnhandledErrorMiddleware } = require('./middlewares');

process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, 'Process exiting due to async error');
    process.exit(1);
})
.on('uncaughtException', (err) => {
    console.error(err, 'Process exiting due to sync error');
    process.exit(1);
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(helmet());

app.use(require('./routes'));

app.use(NotFoundMiddleware);
app.use(UnhandledErrorMiddleware);

if (process.env.NODE_ENV !== 'test') {
    connect(options.mongo.connectionString)
    .then((conn) => app.listen(options.port))
    .catch((err) => {
        process.exit(1);
    });
}

module.exports = {
    app
};