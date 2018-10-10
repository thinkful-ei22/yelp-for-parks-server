'use strict';

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const Location = require('../models/locations');

const router = express.Router();

//instantiate cloudinary config
cloudinary.config({
	cloud_name: process.env.cloud_name,
	api_key: process.env.api_key,
	api_secret: process.env.api_secret
});

//Get locations
router.get('/', (req, res, next) => {
	const { ownerId, zipCode, city, state, searchTerm } = req.query;
	let filter = {};
	let page = req.query.page || 0;
	//filter locations by ownerId
	//add "?ownerId=5bb23cf5f1d49a4288f9092c" to URL query
	if (ownerId) {
		filter.ownerId = ownerId;
	}
	if (zipCode) {
		filter.zipCode = zipCode;
	}
	if (city) {
		filter.city = city;
	}
	if (state) {
		filter.state = state;
	}
	//filter by search term
	if (searchTerm) {
		filter.$text = { $search: searchTerm };
	}
	Location.find(filter)
		.populate('comments')
		.populate('ownerId')
		// .limit(3).skip(page * 3)
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
		.populate('comments')
		.populate('ownerId')
		.then(location => {
			if (location) {
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
		specialInstructions,
		comments = []
	} = req.body;

	const ownerId = req.user.id;

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

	if (!(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode))){
		const err = new Error('Wrong `zipCode` format');
		err.status = 400;
		return next(err);
	}

	//TODO: add validation for empty field
	if (!description) {
		const err = new Error('Missing `description` in request body');
		err.status = 400;
		return next(err);
	}

	if (comments) {
		comments.forEach(comment => {
			if (!mongoose.Types.ObjectId.isValid(comment)) {
				const err = new Error('The comments `id` is not valid');
				err.status = 400;
				return next(err);
			}
		});
	}

	//Remember that amenities and special instructions are not required to post
	const newLocation = {
		title,
		address,
		city,
		state,
		zipCode,
		description,
		ownerId,
		comments
	};

	const values = Object.values(req.files);
	const imageUploadPromises = values.map(image => cloudinary.v2.uploader.upload(image.path, {
		folder: 'parks'
	}));

	Promise
		.all(imageUploadPromises)
		.then(images => {
			newLocation.image = images[0].secure_url;
			return Location.create(newLocation)
				.then(location => {
					res
						.location(`${req.originalUrl}/${location.id}`)
						.status(201)
						.json(location);
				})
				.catch(err => {
					console.log(err);
					next(err);
				});
		});
});

router.put('/:id', passport.authenticate('jwt', { session: false, failWithError: true }), (req, res, next) => {
	const { id } = req.params;
	const ownerId = req.user.id;

	const {
		title,
		address,
		city,
		state,
		zipCode,
		description,
		amenities = [],
		specialInstructions = '',
		comments = []
	} = req.body;

	if (title === '') {
		const err = new Error('Missing `title` in request body');
		err.status = 400;
		return next(err);
	}

	if (address === '') {
		const err = new Error('Missing `address` in request body');
		err.status = 400;
		return next(err);
	}

	if (city === '') {
		const err = new Error('Missing `city` in request body');
		err.status = 400;
		return next(err);
	}

	if (state === '') {
		const err = new Error('Missing `state` in request body');
		err.status = 400;
		return next(err);
	}

	if (zipCode === '') {
		const err = new Error('Missing `zipCode` in request body');
		err.status = 400;
		return next(err);
	}

	if (description === '') {
		const err = new Error('Missing `description` in request body');
		err.status = 400;
		return next(err);
	}

	if (comments) {
		comments.forEach(comment => {
			if (!mongoose.Types.ObjectId.isValid(comment)) {
				const err = new Error('The comments `id` is not valid');
				err.status = 400;
				return next(err);
			}
		});
	}

	const updatedLocation = {
		title,
		address,
		city,
		state,
		zipCode,
		description,
		amenities,
		specialInstructions,
		ownerId,
		comments
	};

	Location.findById(id)
		.then(location => {
			if (location.ownerId !== ownerId){
				const err = new Error('Unauthorized operation. Users are only allowed to edit locations they created.');
				err.status = 422;
				return next(err);
			}
			const image = location.image;
			updatedLocation.image = image;
			return Location.findByIdAndUpdate(id, updatedLocation, { new: true });
		})
		.then(updatedLocation => {
			if (updatedLocation) {
				res.json(updatedLocation);
			} else {
				next();
			}
		})
		.catch(err => {
			next(err);
		});
});

router.put('/:id/image', passport.authenticate('jwt', { session: false, failWithError: true }), (req, res, next) => {
	const { id } = req.params;
	const ownerId = req.user.id;

	const values = Object.values(req.files);
	if(values.length < 1) {
		console.log('no file uploaded!');
		return;
	}
	const imageUploadPromises = values.map(image => cloudinary.v2.uploader.upload(image.path, {
		folder: 'parks'
	}));

	let image;

	Promise
		.all(imageUploadPromises)
		.then(images => {
			image = images[0].secure_url;
			return Location.findById(id)
				.then(location => {
					if (location.ownerId !== ownerId) {
						const err = new Error('Unauthorized operation. Users are only allowed to update images for locations they created.');
						err.status = 422;
						return next(err);
					}
					//extract image public_id
					let regex = /([\w\d_-]*)\.?[^\\\/]*$/i;
					//concatenate with folder name
					const imageId = `parks/${location['image'].match(regex)[1]}`;
					//delete image from cloudinary
					cloudinary.uploader.destroy(imageId, { invalidate: true }, (error, result) => console.log(result, error));
					//delete location
					return Location.findByIdAndUpdate(id, { $set: { image } }, { new: true });
				})
				.then(results => res.json(results));
		})
		.catch(err => {
			next(err);
		});
});

router.delete('/:id', passport.authenticate('jwt', { session: false, failWithError: true }), (req, res, next) => {
	const { id } = req.params;
	const ownerId = req.user.id;

	Location.findById(id)
		.then(location => {
			if (location.ownerId !== ownerId) {
				const err = new Error('Unauthorized operation. Users are only allowed to delete locations they created.');
				err.status = 422;
				return next(err);
			}
			//extract image public_id
			let regex = /([\w\d_-]*)\.?[^\\\/]*$/i;
			//concatenate with folder name
			const imageId = `parks/${location['image'].match(regex)[1]}`;
			//delete image from cloudinary
			cloudinary.uploader.destroy(imageId, { invalidate: true }, (error, result) => console.log(result, error));
			//delete location
			return Location.findByIdAndRemove(id);
		})
		.then(() => {
			res.sendStatus(204);
		})
		.catch(err => {
			next(err);
		});
});

module.exports = router;