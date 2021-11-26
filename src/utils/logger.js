const path = require('path');
const rTracer = require('cls-rtracer');
const { createLogger, format, transports } = require('winston');
const { combine, printf } = format;
require('winston-daily-rotate-file');

const rTracerFormat = printf(({ level, message, timestamp }) => {
    const requestId = rTracer.id();
    let logFormat = `${timestamp} ${level}: ${message}`;
    if (requestId) {
        logFormat = `${timestamp} ${requestId} ${level}: ${message}`;
    }

    return logFormat;
});

const rotatingFileTransport = new transports.DailyRotateFile({
    filename: path.resolve(__dirname, '..', '..', 'logs/%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    utc: true,
    handleExceptions: true,
    handleRejections: true,
    frequency: '1d',
    colorize: true,
	prettyPrint: true,
    level: process.env.ENV === 'production' ? 'error' : 'debug'
});

const logger = createLogger({
    format: combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.splat(),
        format.errors({ stack: true }),
        rTracerFormat
    ),
    defaultMeta: {
        service: 'Todo backend'
    },
    transports: [
        rotatingFileTransport
    ]
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection - %s', reason, (error, level, message, meta) => {
        process.exit(1);
    });
})
.on('uncaughtException', (err) => {
    logger.error('Uncaught exception - %s', err, (error, level, message, meta) => {
        process.exit(1);
    });
});

module.exports = logger;
