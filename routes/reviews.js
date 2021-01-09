const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const ObjectID = require('mongodb').ObjectID;
const reviews = require('../controllers/reviews');

const Campground = require('../models/campground');
const Review = require('../models/review')
const {isLoggedIn ,validateReview, isReviewAuthor} = require('../middleware');

//REVIEW ROUTES
router.post('/', isLoggedIn , validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn, isReviewAuthor ,catchAsync(reviews.deleteReview))

module.exports = router;