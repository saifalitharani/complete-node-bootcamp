const express = require('express');
const viewsController = require('../controllers/viewsController');

const viewRouter = express.Router();

viewRouter.get('/', viewsController.getOverview);
viewRouter.get('/tour/:slug', viewsController.getTour);

module.exports = viewRouter;