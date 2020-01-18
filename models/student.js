const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: { type: String },
    dateOfBirth: { type: Date }
});

module.exports = mongoose.model('Student', studentSchema);