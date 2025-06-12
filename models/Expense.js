const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    splitType: {
        type: String,
        enum: ['equal', 'custom'],
        default: 'equal'
    },
    splitDetails: {
        type: Map,
        of: Number,
        default: new Map()
    }
});

// Create compound index for efficient querying
expenseSchema.index({ groupId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Expense', expenseSchema);