//const fs = require('fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
// );

//Param Middleware.
/*
exports.checkId = (req, res, next, val) => {
    if (val === undefined || val >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }
    next();
};
*/

//Route Handlers.
exports.aliasTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

exports.allTours = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const tours = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour: newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }

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
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: null,
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
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
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const monthlyPlan = await Tour.aggregate([
            {
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
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            requestedAt: req.requestTime,
            message: error.message,
        });
    }
};
