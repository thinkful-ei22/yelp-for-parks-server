'use strict';

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const Comment = require('../models/comments');
const Location = require('../models/locations');

const router = express.Router();

//validate commentId
function validateCommentId(id) {
	if(!mongoose.Types.ObjectId.isValid(id)){
		const err = new Error('The `commentId` is not valid');
		err.status = 400;
		return Promise.reject(err);
	}
	return Comment.countDocuments({ _id: id })
		.then(count => {
			if (count === 0) {
				const err = new Error('`commentId` doesn\'t exist');
				err.status = 404;
				return Promise.reject(err);
			}
		});
}

//GET comments
router.get('/', (req, res, next) => {
	const { locationId, ownerId } = req.query;
  
	let filter = {};

	if(locationId) {
		filter.locationId = locationId;
	}

	if(ownerId) {
		filter.ownerId = ownerId;
	}

	Comment.find(filter)
		.populate('ownerId')
		.sort({ createdAt: 'desc' })
		.then(comments => {
			if(comments) {
				res.json(comments);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});

//GET comment by id
router.get('/:id', (req, res, next) => {
	const id = req.params.id;

	return validateCommentId(id)
		.then(() => {
			Comment.findById(id)
				.populate('ownerId')
				.then(comment => {
					if(comment){
						res.json(comment);
					} else {
						next();
					}
				});
		})
		.catch(err => next(err));
});

//POST/Create comment
router.post('/', passport.authenticate('jwt', {session: false, failWithError: true}), (req, res, next) => {
	const { subject, text, rating, locationId} = req.body;
	const ownerId = req.user.id;

	const newComment = {
		subject,
		text,
		rating, 
		ownerId,
		locationId
	};

	if (!subject) {
		const err = new Error('Missing `subject` in request body');
		err.status = 400;
		return next(err);
	}
	else if(subject.trim() === '') {
		const err = new Error('`subject` can\'t consist of white spaces');
		err.status = 400;
		return next(err);
	}

	// validate locationId
	if (!mongoose.Types.ObjectId.isValid(locationId)) {
		const err = new Error('The `locationId` is not valid');
		err.status = 400;
		return next(err);
	}

	let comment;

	Comment.create(newComment)
		.populate('ownerId')
		.then(_comment => {
			comment = _comment;
			return Location.findByIdAndUpdate(locationId, { $push: { comments: comment.id } });
		})
		.then(() => {
			if (comment){
				res.location(`${req.originalUrl}/${comment.id}`)
					.status(201)
					.json(comment);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});

//PUT/Edit comment
router.put('/:id', passport.authenticate('jwt', 
	{ session: false, failWithError: true }), (req, res, next) => {
	const { subject, text = '', rating = 3, locationId} = req.body;
	const ownerId = req.user.id;
	const id = req.params.id;

	const updatedComment = { 
		subject, 
		text, 
		rating, 
		ownerId,
		locationId
	};

	if (!subject) {
		const err = new Error('Missing `subject` in request body');
		err.status = 400;
		return next(err);
	}
	else if(subject.trim() === '') {
		const err = new Error('`subject` can\'t consist of white spaces');
		err.status = 400;
		return next(err);
	}

	return validateCommentId(id)
		.then(() => {
			Comment.findByIdAndUpdate(id, updatedComment, {new: true})
				.then(updatedComment => {
					if(updatedComment) res.json(updatedComment);
					else next();
				});
		})
		.catch(err => next(err));
});

//DELETE comment
router.delete('/:id', (req, res, next) => {
	const id = req.params.id;

	return validateCommentId(id)
		.then(() => {
			Comment.findByIdAndDelete(id)
				.then(() => {
					res.sendStatus(204).end();
				});
		})
		.catch(err => next(err));
});

module.exports = router;