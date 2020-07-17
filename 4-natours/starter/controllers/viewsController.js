const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1: Get Tour data from collection
    const tours = await Tour.find();
    // 2: Build template
    // 3: Render that template using tour ata from (1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({
        slug: req.params.slug,
    }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour) {
        return next(new AppError('Tour not found with that name', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
});

exports.getAccount = catchAsync(async (req, res, next) => {
    res.status(200).render('account', {
        title: `My Account`,
    });
});

exports.updateData = catchAsync(async (req, res, next) => {
    console.log(res.body);
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('account', {
        title: `My Account`,
        user: updatedUser,
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1: Find all bookings:
    const bookings = await Booking.find({ user: req.user.id });

    //2: Find tours with the returned IDs.
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('overview', {
        title: 'My-Tours',
        tours,
    });
});
