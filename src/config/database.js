const mongoose = require('mongoose');
const config = require('./index');

async function connectDatabase() {
    try {
        const { connectionString, options } = config.mongo;
        await mongoose.connect(connectionString, options);
        console.log(`MongoDb connected on ${new Date()}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDatabase;
