const express = require('express');

const {
    allUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');

const {
    signUp,
    login
} = require('../controllers/authController');

const userRouter = express.Router();
//Using app.route for furthering restructuring the routes - Users' Routes

//Routes defined for normal users.
userRouter.post('/signup', signUp);
userRouter.post('/login', login);

//Routes defined for system administrator!
userRouter.route('/').get(allUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;