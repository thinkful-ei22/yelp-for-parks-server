
const express = require('express');
const bodyParser = require('body-parser');

const Location = require('../models/locations');

const router = express.Router();

router.post('/', (req, res, next) => {

  const {
    title,
    address,
    city,
    state,
    zipCode,
    description,
    amenities = [],
    specialInstructions
  } = req.body;

  //Remember that amenities and special instructions are not required to post
  const newLocation = {
    title,
    address,
    city,
    state,
    zipCode,
    description
  };

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!address) {
    const err = new Error('Missing `address` in request body');
    err.status = 400;
    return next(err);
  }

  if (!state) {
    const err = new Error('Missing `state` in request body');
    err.status = 400;
    return next(err);
  }

  if (!zipCode) {
    const err = new Error('Missing `zipCode` in request body');
    err.status = 400;
    return next(err);
  }

  if (!description) {
    const err = new Error('Missing `description` in request body');
    err.status = 400;
    return next(err);
  }

  Location.create(newLocation)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
