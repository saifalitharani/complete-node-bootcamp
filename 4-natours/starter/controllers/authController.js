const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
    return jwt.sign(
        {
            id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: 90 * 24 * 60 * 60,
        }
    );
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    //Adding Expiry and HttpOnly options in Cookie.
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        //Adding secure method for production environment only (use by HTTPS only)
        secure: req.secure || req.headers['x-forwared-proto'],
    };

    res.cookie('jwt', token, cookieOptions);

    //Remove password from output
    user.password = undefined;

    console.log(res.cookies);
    return res.status(statusCode).json({
        status: 'success',
        token,
        data: user,
    });
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
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log('url:', url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
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

    createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token = '';
    //Step#1: Getting token and verifying if its present in request.
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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
    res.locals.user = currentUser;
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
        email: req.body.email,
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

    //Using try-catch method to capture error if email sent failed
    try {
        //3: Send the reset Token via user email.
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendResetPassword();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email successfully!',
        });
    } catch (err) {
        //If reset email failes to send, we will set passworResetToken and passwordResetExpires field to undefined
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({
            validateBeforeSave: false,
        });
        return next(
            new AppError(
                'There was an error sending the email. Try again later.',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1: Get user based on the token
    const encryptedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //Checking multiple conditions at same time: 1. User exists with encryptedToken 2.Reset Token is still valid.
    const user = await User.findOne({
        passwordResetToken: encryptedToken,
        passwordResetExpires: {
            $gt: Date.now(),
        },
    });

    //2: If token has not expired and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired.', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    //3: Update changePasswordAt property for the user - pre function defined

    //4: Log the user in and send the JWT
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1: get user from collction
    const user = await User.findById(req.user.id).select('+password');

    //2: Check if posted current password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(
            new AppError(
                'Failed to update password: incorrect password entered',
                401
            )
        );
    }

    //3: If so, Update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //4: Login the user and send JWT.
    createSendToken(user, 200, req, res);
});

//Only for rendered pages, and there will be no errors.
exports.isLoggedIn = async (req, res, next) => {
    //Step#1: Getting token and verifying if its present in request.
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //Step#2: Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //Step#4: Check if user has changed password after this token was issued.
            if (await currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There's a logged in user.
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'logged-out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    return res.status(200).json({
        status: 'success',
    });
});
