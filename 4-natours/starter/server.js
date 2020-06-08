const dotenv = require('dotenv');

dotenv.config({
    path: './config.env',
});

const app = require('./app');

//Creating the server:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});