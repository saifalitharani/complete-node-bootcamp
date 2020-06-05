const fs = require('fs');
const superagent = require('superagent');

const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject('I could not read the file');
            resolve(data);
        });
    });
};

const writeFilePro = (file, data) => {
    //Promise constructor was part of ES6, and it takes executor function as argument
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, err => {
            if (err) reject('Could not write the file ');
            resolve('data written successfully');
        });
    });
};

//Using Async/Await
const getDogPic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log(`Breed: ${data}`);

        const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        console.log(res.body.message);

        await writeFilePro(`${__dirname}/dog-image.txt`, res.body.message);
        console.log('data writen successfully');
    }
    catch(err) {
        console.log(err.message);
        throw err;
    }

    return '2: Dog pic fetched successfully!';
}

//Using Async/Await to fetch multiple dog pics
const getDogPicMultiple = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log(`Breed: ${data}`);

        const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res2Pro = superagent.get(`https://dog.ceo/api/breed/labrador/images/random`);
        const res3Pro = superagent.get(`https://dog.ceo/api/breed/hound/images/random`);
        
        const all = await Promise.all([res1Pro, res2Pro, res3Pro]); //will execute all the Pending promises together -> resolved result in all.
        const images = all.map(el => el.body.message);
        console.log(images);

        await writeFilePro(`dog-image.txt`, images.join('\n'));
        console.log('data writen successfully');
    }
    catch(err) {
        console.log(err.message);
        throw err;
    }

    return '2: Dog pic fetched successfully!';
}



//Returning values and handling via promises
/*
console.log('1. Lets fetch dog pics');
getDogPic().then(x => {
    console.log(x);
    console.log('3: Done getting dog pics!');
}).catch(err => 
    console.log('ERROR: ' + err.message + ' ✴️'));
*/

//Returning values and handling via async/await.
(async () => {
    try {
        console.log('1. Lets fetch dog pics');
        const returnVal = await getDogPicMultiple();
        console.log(returnVal);
        console.log('3: Done getting dog pics!');
    }
    catch (err) {
        console.log('ERROR: ' + err.message + ' ✴️');
    }
})();



//Using Promises.
/*
readFilePro(`${__dirname}/dog.txt`)
    .then((data) => {
        console.log(`Breed: ${data}`);
        return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
    })
    .then((res) => {
        console.log(res.body.message);
        return writeFilePro(`${__dirname}/dog-image.txt`, res.body.message)
    })
    .then((data) => {
        console.log(data);
    })
    .catch(err => {
        console.log(err.message);
    });
*/