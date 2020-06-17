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
} = require('../controllers/tourController');

const {
    protect
} = require('../controllers/authController');

const router = express.Router();
//router.param('id', checkId);

//Defining all the child routes of: /api/v1/tours
router.route('/top-5-tours').get(aliasTour, allTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, allTours).post(createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;