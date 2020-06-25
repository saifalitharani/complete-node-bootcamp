const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Reviews = require('../models/reviewModel');
const factory = require('./handlerFactory');


exports.getAllReviews = factory.getAll(Reviews);
/*
exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    //Handling NestedRoute case here.
    if (req.params.tourId) {
        filter = {
            tour: req.params.tourId,
        };
    }

    const reviews = await Reviews.find(filter);

    if (!reviews) {
        return new AppError('No reviews found!', 400);
    }

    res.status(200).json({
        status: 'success',
        length: reviews.length,
        data: {
            reviews,
        },
    });
});
*/

//Middleware
exports.setTourUserIds = (req, res, next) => {
    //Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

/*
exports.createReview = catchAsync(async (req, res, next) => {
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
*/

exports.createReview = factory.createOne(Reviews);
exports.getReviewById = factory.getOne(Reviews, null);
exports.updateReview = factory.updateOne(Reviews);
exports.deleteReview = factory.deleteOne(Reviews);