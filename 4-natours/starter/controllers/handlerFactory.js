const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                tour: doc,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) {
            query = query.populate(populateOptions);
        }
        const doc = await query;
        if (!doc) {
            return next(new AppError('document not found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                doc,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        let filter = {};
        //Handling NestedRoute case here.
        if (req.params.tourId) {
            filter = {
                tour: req.params.tourId,
            };
        }
        const features = new ApiFeatures(Model.find(filter), req.query)
            .filter()
            .sorting()
            .fields()
            .pagination();
        // const docs = await features.query.explain();
        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: docs.length,
            data: {
                docs,
            },
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('doc not found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('Document not found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: null,
        });
    });