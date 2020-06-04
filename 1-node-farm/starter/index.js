const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');
/*
//Reading and Writing Files Synchronously
const txtIn = fs.readFileSync('./txt/input.txt','utf-8');
console.log(txtIn);
const txtOut = `This is what we know about avocado: ${txtIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', txtOut);
console.log('File written successfully!');

//Reading and Writing Files Asynchronously
fs.readFile('./txt/start.txt', 'utf-8', (err,data1) => {
    if (err) return console.log('error ✴️');
    fs.readFile(`./txt/${data1}.txt`,'utf-8', (err,data2) => {
        console.log(data2);
        fs.readFile(`./txt/append.txt`,'utf-8', (err,data3) => {
            console.log(data3);
            fs.writeFile(`./txt/final.txt`, `${data2}\n${data3}`, 'utf-8', err => {
                console.log('File written successfully on final txt! 😆');
            });
        });
    });
});

console.log('Reading the start file');
*/

const jsonData = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(jsonData);

const slugs = productData.map((el) =>
  slugify(el.productName, {
    lower: true,
  })
);
console.log(slugs);

//Server:

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true); //latest syntax ES6

  if (pathname === '/' || pathname === '/overview') {
    const cardHtml = productData
      .map((element) => replaceTemplate(templateCard, element))
      .join(''); //This will contain html of cards based on different products.
    const output = templateOverview.replace(/{%PRODUCT_CARDS%}/g, cardHtml);
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.end(output);
  } else if (pathname === '/product') {
    const product = productData[query.id]; //Retrieving product data from array of products based on id.
    const output = replaceTemplate(templateProduct, product);
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.end(output);
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(jsonData);
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'my-own-headers': 'hello world',
    });
    res.end('<h1>Page not found</h1>');
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
