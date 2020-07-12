const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.use(authController.isLoggedIn);
viewRouter.get('/', viewsController.getOverview);
viewRouter.get('/tour/:slug', viewsController.getTour);
viewRouter.get('/login', viewsController.getLoginForm);

module.exports = viewRouter;