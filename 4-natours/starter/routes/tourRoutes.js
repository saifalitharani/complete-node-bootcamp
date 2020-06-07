const express = require('express');
const app = express();

const {allTours, createTour, getTourById, updateTour, deleteTour} = require('./../controllers/tourController');

const router = express.Router();
router.route('/').get(allTours).post(createTour);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = router;