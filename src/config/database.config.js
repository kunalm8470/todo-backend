const mongoose = require('mongoose');
const { mongo: { options } } = require('./env.config');

const connect = (connectionString) => mongoose.connect(connectionString, options);

module.exports = connect;
