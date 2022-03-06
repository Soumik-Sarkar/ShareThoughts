const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Comment',commentSchema);