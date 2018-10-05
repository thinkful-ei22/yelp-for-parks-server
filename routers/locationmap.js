'use strict';

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('../config.js');
const axios = require('axios');

const router = express.Router();

router.post('/', passport.authenticate('jwt', { session: false, failWithError: true }), (req, res, next) => {
  const { adminDistrict, postalCode, locality, addressLine } = req.body;

  const newLocationMap = {
    adminDistrict,
    postalCode,
    locality,
    addressLine,
    key: config.key
  };

  console.log('We are right before the axios request!')
  let latitude;
  let longitude;
  let coordinates;
  axios(`http://dev.virtualearth.net/REST/v1/Locations/US/${newLocationMap.adminDistrict}/${newLocationMap.postalCode}/${newLocationMap.locality}/${newLocationMap.addressLine}?o=json&key=${newLocationMap.key}`)
  .then(response => {
    latitude = response.data.resourceSets[0].resources[0].point.coordinates[0];
    longitude = response.data.resourceSets[0].resources[0].point.coordinates[1];
    coordinates = {
      lat: latitude,
      lng: longitude
    }
    return res.json(coordinates);
  })
  .catch(err => console.log(err))
});

module.exports = router;
