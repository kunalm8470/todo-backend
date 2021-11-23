const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;
const connect = async () => {
    mongod = await MongoMemoryServer.create();
    const connectionString = mongod.getUri();
    
    // usecreateindex, usefindandmodify, poolsize are not supported
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    await mongoose.connect(connectionString, options);
};

const disconnect = async () => {
    await mongoose.disconnect();
    await mongod.stop();
};

const setupTestData = (model, fixture) => model.insertMany(fixture);
const teardownTestData = (model) => model.deleteMany(Object.create(null));

module.exports = {
    connect,
    disconnect,
    setupTestData,
    teardownTestData
};
