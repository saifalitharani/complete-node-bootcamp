const app = require('./app');

//Creating the server:
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});