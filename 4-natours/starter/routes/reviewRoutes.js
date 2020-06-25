const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router({
    mergeParams: true,
});

reviewRouter
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

reviewRouter
    .route('/:id')
    .get(reviewController.getReviewById)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = reviewRouter;