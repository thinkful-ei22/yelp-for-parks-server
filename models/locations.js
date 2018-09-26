'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const LocationSchema = mongoose.Schema({
  title: {type: String, required: true, unique: true},
  address: {type: String, required: true, unique: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zipCode: {type: Number, required: true},
  description: {type: String, required: true},
  amenities: {type: Array, default: []},
  specialInstructions: {type: String, default: ''},
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {type: String}
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
