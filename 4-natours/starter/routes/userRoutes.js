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
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('../controllers/authController');

const userRouter = express.Router();
//Using app.route for furthering restructuring the routes - Users' Routes

//Routes defined for normal users.
userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.post('/updatePassword', protect, updatePassword);
userRouter.patch('/updateMe', protect, updateMe);
userRouter.delete('/deleteMe', protect, deleteMe);
userRouter.get('/me', protect, getMe, getUser);

//Routes defined for system administrator!
userRouter.route('/').get(allUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;