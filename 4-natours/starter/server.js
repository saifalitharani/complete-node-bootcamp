const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: './config.env',
});

//UNHANDLED REJECTED PROMISES HANDLER
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

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

//Creating the server:
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});

//UNHANDLED REJECTED PROMISES HANDLER
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});