'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const locationSchema = mongoose.Schema({
  title: {type: String, required: true, unique: true},
  address: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zipCode: {type: Number, required: true},
  description: {type: String, required: true},
  amenities: {type: Array, default: []},
  specialInstructions: {type: String, default: ''},
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ]
});

locationSchema.set('timestamps', true);

locationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
