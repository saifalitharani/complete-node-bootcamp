const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = jwt.sign({
            id: newUser._id,
        },
        process.env.JWT_SECRET, {
            expiresIn: 90 * 24 * 60 * 60,
        }
    );

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});