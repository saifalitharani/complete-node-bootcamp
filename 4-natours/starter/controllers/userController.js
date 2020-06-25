const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const retObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            retObj[el] = obj[el];
        }
    });
    return retObj;
};

exports.updateMe = async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route does not allow password update. Use /updatePassword route instead.',
                400
            )
        );
    }

    const user = await User.findById(req.user._id);

    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody, {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        active: false,
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.allUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: users ? users.length : 0,
        data: {
            users,
        },
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

//Using Handler Factory - Do not use this to update Password
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);