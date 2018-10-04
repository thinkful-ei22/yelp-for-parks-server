'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const locationMapSchema = mongoose.Schema({
  adminDistrict: { type: String, required: true},
  postalCode: { type: String, required: true},
  locality: { type: String, required: true},
  addressLine: { type: String, required: true},
  key: { type: String, required: true},
});

locationMapSchema.set('timestamps', true);

locationMapSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

const LocationMap = mongoose.model('LocationMap', locationMapSchema);

module.exports = LocationMap;
