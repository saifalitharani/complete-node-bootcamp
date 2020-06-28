const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({
    path: './config.env',
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

try {
    mongoose
        .connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(() =>
            console.log('Database connection established successfully')
        );
} catch (error) {
    console.log(error);
}

const toursData = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const usersData = JSON.parse(
    fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewsData = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//IMPORTING DATA INTO DATABASE
const importData = async () => {
    try {
        await Tour.create(toursData);
        await User.create(usersData, {
            validateBeforeSave: false,
        });
        await Review.create(reviewsData);
        console.log('data successfully loaded!');
        process.exit();
    } catch (err) {
        console.log('ERROR 💥', err);
    }
};

//IMPORTING DATA INTO DATABASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('data successfully deleted!');
        process.exit();
    } catch (err) {
        console.log('ERROR 💥', err);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);