const mongoose = require('mongoose');
const { Schema } = mongoose;

const TodoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

TodoSchema.index({ title: 1, description: 1 }, { unique: true });

module.exports = mongoose.model('todos', TodoSchema, 'todos');
