'use strict';

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const Comment = require('../models/comments');

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

  return validateCommentId(id)
    .then(() => {
      Comment.findById(id)
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
router.post('/', passport.authenticate('jwt', 
  {session : false, failWithError: true}), (req, res, next) => {
  const { subject, text, rating } = req.body;
  const ownerId = req.user.id;

  const newComment = {
    subject,
    text,
    rating, 
    ownerId
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

//PUT/Edit comment
router.put('/:id', passport.authenticate('jwt', 
  { session: false, failWithError: true }), (req, res, next) => {
  const { subject, text, rating } = req.body;
  const ownerId = req.user.id;
  const id = req.params.id;

  const updatedComment = { 
    subject, 
    text, 
    rating, 
    ownerId 
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