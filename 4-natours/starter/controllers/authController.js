const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({
            id,
        },
        process.env.JWT_SECRET, {
            expiresIn: 90 * 24 * 60 * 60,
        }
    );
};

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    //1) Check if email and password exists
    if (!email || !password) {
        return next(
            new AppError('Please provide both email and password', 400)
        );
    }
    //2) Check if user exists and password is correct
    const user = await User.findOne({
        email,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }

    const token = signToken(user.id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token = '';
    //Step#1: Getting token and verifying if its present in request.
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'You cannot access this resource. Please log-in to continue',
                401
            )
        );
    }

    //Step#2: Verifying the token.
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Step#3: Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token no longer exists.',
                401
            )
        );
    }

    //Step#4: Check if user has changed password after this token was issued.
    if (await currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password. Login again.', 401)
        );
    }

    //If JWT satisfies all the prior conditions, GRANT ACCESS to protected routes.
    //attaching the user object to the request object, which travels from middleware to middleware.
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action.',
                    403
                )
            );
        }
        //If user's role belong to the 'roles' array, then only he can access the resource.
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1: Get User based on posted email.
    const user = await User.findOne({
        email: req.body.email
    });

    if (!user) {
        return next(
            new AppError('There is no user with this email address.', 404)
        );
    }

    //2: Generate the random reset token --> Defining instance method on User.
    const resetToken = user.createPasswordResetToken();

    //Saving the Encrypted Reset Token and Expire Time.
    await user.save({
        validateBeforeSave: false,
    });

    //3: Semdomg the reset Token via user email.
    next();
});