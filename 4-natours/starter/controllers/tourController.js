//const fs = require('fs');
const Tour = require('../models/tourModel');
// const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//Route Handlers.
exports.aliasTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

//Implemented using handlerFactory
exports.allTours = factory.getAll(Tour);
/*
exports.allTours = catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(Tour.find(), req.query)
        .filter()
        .sorting()
        .fields()
        .pagination();
    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours,
        },
    });
});
*/

//Implemented using handlerFactory
exports.getTourById = factory.getOne(Tour, {
    path: 'reviews',
});

/*
exports.getTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
        return next(new AppError('Tour not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tours: tour,
        },
    });
});
*/

exports.createTour = factory.createOne(Tour);

/*
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         data: {
//             tour: newTour,
//         },
//     });
    /*const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign(req.body, {
        id: newId,
    });
    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            if (err) return;
            res.status(201).json({
                status: 'success',
                requestedAt: req.requestTime,
                data: {
                    tour: newTour,
                },
            });
        }
    );
    */
//});

//Using Handler Factory
exports.updateTour = factory.updateOne(Tour);
/*
exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('Tour not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tour,
        },
    });
});
*/

//Using Handler Factory
exports.deleteTour = factory.deleteOne(Tour);

/*exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError('Tour not found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: null,
    });
});
*/

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([{
            //Defining stage for Match operator.
            $match: {
                ratingsAverage: {
                    $gte: 4.5,
                },
            },
        },
        {
            $group: {
                _id: {
                    $toUpper: '$difficulty',
                },
                numTours: {
                    $sum: 1,
                },
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
                avgRating: {
                    $avg: '$ratingsAverage',
                },
                avgPrice: {
                    $avg: '$price',
                },
                minPrice: {
                    $min: '$price',
                },
                maxPrice: {
                    $max: '$price',
                },
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: stats.length,
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const monthlyPlan = await Tour.aggregate([{
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$startDates',
                },
                numTourStarts: {
                    $sum: 1,
                },
                tours: {
                    $push: '$name',
                },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numTourStarts: -1,
            },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: monthlyPlan.length,
        data: {
            monthlyPlan,
        },
    });
});