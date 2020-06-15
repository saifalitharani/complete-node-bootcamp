const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        unique: [true, 'User already exists with the same email address'],
        required: [true, 'Please enter your email address'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [8, 'A password must have more or equal then 8 characters'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the password.'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'The passwords does not match!',
        },
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
