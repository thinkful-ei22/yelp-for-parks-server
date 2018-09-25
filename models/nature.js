'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const NatureSchema = mongoose.Schema({
  title: {type: String, required: true, unique: true},
  address: {type: String, required: true, unique: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zipCode: {type: Number, required: true},
  description: {type: String, required: true},
  amenities: {type: Array},
  specialInstructions: {type: String},
});

const Nature = mongoose.model('Nature', NatureSchema);

module.exports = Nature;
