const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedIn, viewsController.getOverview);
viewRouter.get(
    '/tour/:slug',
    authController.isLoggedIn,
    viewsController.getTour
);
viewRouter.get(
    '/login',
    authController.isLoggedIn,
    viewsController.getLoginForm
);
viewRouter.get('/me', authController.protect, viewsController.getAccount);

module.exports = viewRouter;