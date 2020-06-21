const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

//GLOBAL MIDDLEWARES.
//Adding a middleware to allow server to use req.body on POST requests

//Set security HTTP headers
app.use(helmet());

//Using morgan as logger when we are in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit request from same api over certain period of time.
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from tis IP, please try again in an hour.',
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body.
app.use(express.json({ limit: '10kb' }));

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Adding custom middleware - add request time to response.
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
