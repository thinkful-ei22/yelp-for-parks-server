'use strict';

const express = require('express');
const passport = require('passport');
const Location = require('../models/locations');

const router = express.Router();

//Get locations
router.get('/', (req, res, next) => {
  Location.find()
    .then(locations => {
      res.json(locations);
    })
    .catch(err => {
      next(err);
    });
});

//Get location by Id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  
  Location.findById(id)
    .populate({
      path: 'comments', options: { sort: { time: +1 }},
      populate: { path: 'userId', select: 'firstName'}
    })
    .then(location => {
      if(location){
        res.json(location);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


//Create new location (only authenticated users)
router.post('/', passport.authenticate('jwt', { session: false, failWithError: true }), (req, res, next) => {

  const {
    title,
    address,
    city,
    state,
    zipCode,
    description,
    amenities,
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

  //TODO: add validation for empty field
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  //TODO: add validation for empty field
  if (!address) {
    const err = new Error('Missing `address` in request body');
    err.status = 400;
    return next(err);
  }

  //TODO: add validation for empty field
  if (!state) {
    const err = new Error('Missing `state` in request body');
    err.status = 400;
    return next(err);
  }

  //Do we need zipcode validation, i.e correct format?
  //TODO: add validation for empty field
  if (!zipCode) {
    const err = new Error('Missing `zipCode` in request body');
    err.status = 400;
    return next(err);
  }

  //TODO: add validation for empty field
  if (!description) {
    const err = new Error('Missing `description` in request body');
    err.status = 400;
    return next(err);
  }

  Location.create(newLocation)
    .then(location => {
      res
        .location(`${req.originalUrl}/${location.id}`)
        .status(201)
        .json(location);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
