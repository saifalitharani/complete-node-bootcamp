const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const reviewRouter = express.Router();

reviewRouter
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.ceateReview
    );

module.exports = reviewRouter;