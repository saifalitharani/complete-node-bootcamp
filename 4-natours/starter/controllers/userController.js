const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

/*
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    },
});
*/
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Pleae upload only images', 400));
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const retObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            retObj[el] = obj[el];
        }
    });
    return retObj;
};

//GetMe middleware for /me endpoint
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route does not allow password update. Use /updatePassword route instead.',
                400
            )
        );
    }

    const user = await User.findById(req.user._id);

    const filteredBody = filterObj(req.body, 'name', 'email');

    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        active: false,
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

/*
exports.allUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: users ? users.length : 0,
        data: {
            users,
        },
    });
});
*/

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use signup instead',
    });
};

exports.allUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//Using Handler Factory - Do not use this to update Password
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
