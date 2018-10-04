'use strict';

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const LocationMap = require('../models/locationmap');
const config = require('../config.js');
const axios = require('axios');

const router = express.Router();

//POST/Create comment
router.post('/', passport.authenticate('jwt', {session: false, failWithError: true}), (req, res, next) => {
  const { adminDistrict, postalCode, locality, addressLine } = req.body;

  const newLocationMap = {
    adminDistrict,
    postalCode,
    locality,
    addressLine,
    key: config.key
  };

  let latitude;
  let longitude;
  let coordinates;
  axios.get(`http://dev.virtualearth.net/REST/v1/Locations/US/${newLocationMap.adminDistrict}/${newLocationMap.postalCode}/${newLocationMap.locality}/${newLocationMap.addressLine}?o=json&key=${newLocationMap.key}`)
  .then(res => {
    console.log("Latitude within axios", res.data.resourceSets[0].resources[0].point.coordinates[0])
    console.log("Longitude within axios", res.data.resourceSets[0].resources[0].point.coordinates[1])
    latitude = res.data.resourceSets[0].resources[0].point.coordinates[0];
    longitude = res.data.resourceSets[0].resources[0].point.coordinates[1];
    coordinates = {
      lat: latitude,
      lng: longitude
    }
    console.log("Right before coordinates return statement in axios", coordinates);
    return res.json(coordinates);
  })
});

module.exports = router;
