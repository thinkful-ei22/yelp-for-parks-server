'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
});

UserSchema.methods.serialize = () => ({
  username: this.username || '',
  firstName: this.firstName || '',
  lastName: this.lastName || ''
});

UserSchema.methods.validatePassword = (password) => {
  bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = (password) => {
  bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
