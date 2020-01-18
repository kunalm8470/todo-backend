const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
    name: { 
        type: String,
        unique : false,
        required : true
    }
}, {timestamps: true });

const personSchema = new Schema({
    name: { 
            type: String,
            unique : true,
            required : true
    },
    children: [childSchema]
}, { timestamps: true });

module.exports = mongoose.model('person', personSchema);