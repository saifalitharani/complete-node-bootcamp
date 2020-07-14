//const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
// const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Pleae upload only images', 400));
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// Uploading Images in different fields with different maxCounts
exports.uploadTourImages = upload.fields([{
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 3,
    },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
            quality: 90,
        })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({
                    quality: 90,
                })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );
    next();
});

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {
        distance,
        latlng,
        unit,
    } = req.params;

    const [lat, lng] = latlng.split(',');

    //calculating radius in radians.
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError(
                'Latitude and Longitude must be defined in format: -lat,long',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    })

    console.log(distance, lat, lng, unit);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length > 0 ? tours.length : 0,
        data: {
            tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const {
        latlng,
        unit,
    } = req.params;

    const [lat, lng] = latlng.split(',');

    //geoNear calculates distance in Metres. Hence, we calculate multiplier based on units passed in params.
    const multiplier = unit === 'km' ? 0.001 : 0.000621371;

    if (!lat || !lng) {
        next(
            new AppError(
                'Latitude and Longitude must be defined in format: -lat,long',
                400
            )
        );
    }

    const distances = await Tour.aggregate([{
        $geoNear: {
            near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1],
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier,
        },
    }, {
        $project: {
            distance: 1,
            name: 1,
        },
    }, ]);

    console.log(lat, lng, unit);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            distances,
        },
    });
});