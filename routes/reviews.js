const express = require('express');
const router = express.Router({ mergeParams: true }); // use campground id from req.params
const reviewController = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');



// post a review under a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))

// delete a review under a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))



module.exports = router;