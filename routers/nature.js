'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const Nature = require('../models/nature');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res, next) => {

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

  const userId = req.user.id;

  //Remember that amenities and special instructions are not required to post
  const newNatureSpot = {
    title,
    address,
    city,
    state,
    zipCode,
    description,
    userId
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

  Nature.create(newNatureSpot)
  .then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`) //You will have to add '/${result.id} in here later'
      .status(201)
      .json(result);
  })
  .catch(err => {
      next(err);
    });
});

module.exports = router;
