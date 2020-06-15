const express = require('express');
const app = express();
const {
    allUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
} = require('./../controllers/userController');


const userRouter = express.Router();
//Using app.route for furthering restructuring the routes - Users' Routes
userRouter.route('/').get(allUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;