const express = require('express');

const {
    allTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour,
    //checkId,
    //checkBody,
    aliasTour,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
} = require('../controllers/tourController');

const {
    protect,
    restrictTo
} = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();
//router.param('id', checkId);

//Defining all the child routes of: /api/v1/tours
router.route('/top-5-tours').get(aliasTour, allTours);
router.route('/tour-stats').get(getTourStats);
router
    .route('/monthly-plan/:year')
    .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router
    .route('/')
    .get(protect, allTours)
    .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
    .route('/:id')
    .get(getTourById)
    .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;