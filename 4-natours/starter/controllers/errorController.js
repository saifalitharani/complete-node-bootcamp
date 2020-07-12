const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path} :  ${error.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
    const field = error.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('Invalid Token! Please login again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Token Expired! Please login again.', 401);

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // - Operational: trusted error can be sent to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // - non Operational, send generic error
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }

    // RENDERED WEBSITE
    // - Operational: trusted error can be sent to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }

    // - non Operational, send generic error
    return res.status(500).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later',
    });
};

//Global Error Handling Middleware.
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {
            ...err,
        };
        error.message = err.message;

        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldsDB(err);
        }
        if (err.message.startsWith('Validation failed')) {
            error = new AppError(err.message, 400);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, req, res);
    }
};