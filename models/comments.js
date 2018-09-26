'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
  subject: { type: String, default: '' },
  text: { type: String, default: '' },
  rating: { type: Number, default: 3 },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Comment', commentSchema);

module.exports = Comment;