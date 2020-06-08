const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
);

//Param Middleware.
exports.checkId = (req, res, next, val) => {
    if (val === undefined || val >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }
    next();
};

//Route Handlers.

exports.checkBody = (req, res, next) => {
    if (!req.body.price || !req.body.name) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price',
        });
    }
    next();
};

exports.allTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};

exports.getTourById = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find((el) => el.id === id);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tour: tour,
        },
    });
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
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
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            tour: '<Updated code here>',
        },
    });
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: null,
    });
};