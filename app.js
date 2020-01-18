const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Require the routes
const studentRouter = require('./routes/studentRouter');
const parentRouter = require('./routes/parentRouter');

const db = require('./config/database');

const app = express();
db();

app.use(bodyParser.json());
app.use(cors());

// Mounted routes
app.use('/api/Students', studentRouter);
app.use('/api/Parents', parentRouter);

// Not found route
app.use((req, res, next) => {
    const error = new Error(`Route not found with - ${req.originalUrl}`);
    error.status = 404;
    return next(error);
});

// Global error handling route
app.use((err, req, res, next) => {
    return res.status(err.status || 500)
              .json({
                  error: {
                      message: err.message
                  }
              });
});

app.listen(process.env.APP_PORT || 4000, console.log.bind(console, 'Server started!'));