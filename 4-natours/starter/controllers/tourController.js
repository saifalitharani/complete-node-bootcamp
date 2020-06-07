const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8'));

exports.allTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json(
    {
        status: 'success', 
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours
        }
    });
};

exports.getTourById = (req, res) => {
    const id = req.params.id * 1;
    if (id !== undefined && id < tours.length) {
        const tour = tours.find(el=> el.id === id);
        res.status(200).json(
        {
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour: tour
            }
        });
    }
    else {
        res.status(404).json(
        {
            status: 'failure',
            message: 'invalid id'
        });
    }
};

exports.createTour = (req, res) => {    
    const newId = (tours[tours.length - 1].id) + 1;
    const newTour = Object.assign({id: newId}, req.body);
    tours.push(newTour);

    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        if (err) return console.log(err.message);
        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour : newTour,
            }
        });
    });
};

exports.updateTour = (req, res) => {
    const id = req.params.id * 1;
    if (id !== undefined && id < tours.length) {
        const tour = tours.find(el=> el.id === id);
        res.status(200).json(
        {
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour: "<Updated code here>"
            }
        });
    }
    else {
        res.status(404).json(
        {
            status: 'failure',
            message: 'invalid id'
        });
    }
};

exports.deleteTour = (req, res) => {
    const id = req.params.id * 1;
    if (id !== undefined && id < tours.length) {
        const tour = tours.find(el=> el.id === id);
        res.status(204).json(
        {
            status: 'success',
            requestedAt: req.requestTime,
            data: null
        });
    }
    else {
        res.status(404).json(
        {
            status: 'failure',
            message: 'invalid id'
        });
    }
};