const express = require('express');

const {
    getMe,
    allUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
} = require('../controllers/userController');

const {
    protect,
    restrictTo,
    signUp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('../controllers/authController');

const userRouter = express.Router();
//Using app.route for furthering restructuring the routes - Users' Routes

//Routes defined for normal users.
userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.use(protect);

userRouter.post('/updatePassword', updatePassword);
userRouter.patch('/updateMe', updateMe);
userRouter.delete('/deleteMe', deleteMe);
userRouter.get('/me', getMe, getUser);

//Routes defined for system administrator!
userRouter.use(restrictTo('admin'));

userRouter.route('/').get(allUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;