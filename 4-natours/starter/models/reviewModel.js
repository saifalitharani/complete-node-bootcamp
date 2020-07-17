const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: 'String',
            required: [true, 'The review must contain description'],
        },
        rating: {
            type: 'Number',
            min: 1,
            max: 5,
        },
        createdAt: {
            type: 'Date',
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to particular user'],
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

reviewSchema.index(
    {
        tour: 1,
        user: 1,
    },
    {
        unique: true,
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    }).populate({
        path: 'tour',
        select: 'name',
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId,
            },
        },
        {
            $group: {
                _id: '$tour',
                nRatings: {
                    $sum: 1,
                },
                avgRatings: {
                    $avg: '$rating',
                },
            },
        },
    ]);
    console.log(stats);

    //Persisting the information in the correct fields/
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRatings,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

//Calculating Average Rating on Tours - CREATE scenario.
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

//Calculating Average Rating on Tours - UPDATE and DELETE scenario.
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne(); //Storing returned document on the query variable -> in order to use it in our post middleware
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    //this.r.constructor = Model.
    //Calling the function only when the query has been successfully executed.
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
