const express = require('express');

const {
    allTours,
    createTour,
    getTourById,
    updateTour,
    deleteTour,
    checkId,
    checkBody,
} = require('../controllers/tourController');

const router = express.Router();
router.param('id', checkId);

router.route('/').get(allTours).post(checkBody, createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;