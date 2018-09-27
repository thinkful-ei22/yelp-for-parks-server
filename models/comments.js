'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
  subject: { type: String, required: true},
  text: { type: String, default: '' },
  rating: { type: Number, default: 3 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// commentSchema.index({ _id: 1, ownerId: 1 }, { unique: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;