'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  city: { type: String, default: ''}
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
  }
});

userSchema.set('timestamps', true);

userSchema.methods.validatePassword = function(password){
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password){
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = User;