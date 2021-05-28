const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');
const config = require('./config');

require('./config/database')();
const app = express();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Process exiting due to async error', reason);
    process.exit(1);
})
.on('uncaughtException', (err) => {
    console.error('Process exiting due to sync error', err);
    process.exit(1);
});

app.use(express.json());
app.use(cors());
app.use(compression());

app.use('/api', require('./routes'));

// Not found route
app.use('*', (req, res, next) => {
    const error = new Error(`Route not found with - ${req.originalUrl}`);
    error.status = StatusCodes.NOT_FOUND;
    return next(error);
});

// Global error handling route
app.use((err, req, res, next) => {
    const statusCode = err.status ? err.status : StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json({
        error: 'SERVER_ERROR',
        error_description: err.message
    });
});

app.listen(config.port, () => {
    console.log(`Server listening on port: ${config.port}`);
});
