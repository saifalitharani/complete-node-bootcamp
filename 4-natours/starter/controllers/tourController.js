//const fs = require('fs');
const Tour = require('../models/tourModel');

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
exports.allTours = async (req, res) => {
    try {
        /*
        const tours = await Tour.find()
            .where('duration')
            .equals(5)
            .where('difficulty')
            .equals('easy');
        */

        //Filtering: gte|gt|lte|lt
        const queryObj = {
            ...req.query,
        };
        console.log('queryObj', queryObj);
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        //Advance Filtering:
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        console.log('queryStr', JSON.parse(queryStr));

        let query = Tour.find(JSON.parse(queryStr));

        /*  APPLYING CHAINING TO THE QUERY  */
        //Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        //Fields + Projections
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }
        //Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = limit * (page - 1);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exists.');
            query = query.skip(skip).limit(limit);
        }
        const tours = await query;

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