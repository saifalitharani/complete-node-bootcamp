const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: './config.env',
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
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});