'use strict';

const express = require('express');
const passport = require('passport');
const Comment = require('../models/comments');

const router = express.Router();

//GET comments
router.get('/', (req, res, next) => {
  Comment.find()
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

  Comment.findById(id)
    .then(comment => {
      if(comment){
        res.json(comment);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

//POST comment
router.post('/', passport.authenticate('jwt', 
  {session : false, failWithError: true}), (req, res, next) => {
  const { subject, text, rating } = req.body;
  const ownerId = req.user.id;

  const newComment = {subject, text, rating, ownerId};

  if (!subject) {
    const err = new Error('Missing `subject` in request body');
    err.status = 400;
    return next(err);
  }

  Comment.create(newComment)
    .then(comment => {
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

module.exports = router;