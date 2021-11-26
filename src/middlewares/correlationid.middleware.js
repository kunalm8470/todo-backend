const rTracer = require('cls-rtracer');
const { v4: uuid } = require('uuid');

module.exports = rTracer.expressMiddleware({
    echoHeader: true,
    headerName: 'X-Correlation-Id',
    requestIdFactory: (req) => uuid()
});
