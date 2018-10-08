'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
  subject: { type: String, required: true},
  text: { type: String, default: '' },
  rating: { type: Number, default: 3 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }
});

commentSchema.set('timestamps', true);

commentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;