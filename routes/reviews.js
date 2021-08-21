const express = require('express');
const router = express.Router({mergeParams:true}); //now we have access to the params like id declared on the other filer
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const Campground = require('../models/campground');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;