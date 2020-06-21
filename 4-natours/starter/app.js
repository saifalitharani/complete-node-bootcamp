const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

//GLOBAL MIDDLEWARES.
//Adding a middleware to allow server to use req.body on POST requests
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from tis IP, please try again in an hour.',
});

app.use('/api', limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//Adding custom middleware:
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find the ${req.originalUrl} on server.`, '404'));
});

//Global Error Handling Middleware.
app.use(globalErrorHandler);

module.exports = app;