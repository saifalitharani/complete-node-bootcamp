const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Reviews = require('../models/reviewModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Reviews.find();
    if (!reviews) {
        return new AppError('No reviews found!', 400);
    }

    res.status(200).json({
        status: 'success',
        length: reviews.length,
        data: reviews,
    });
});

exports.ceateReview = catchAsync(async (req, res, next) => {
    const newReview = await Reviews.create({
        review: req.body.review,
        rating: req.body.rating,
        user: req.body.user,
        tour: req.body.tour,
    });
    res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            review: newReview,
        },
    });
});