const express= require('express');
const bodyParser = require('body-parser');
const scrape = require('./scrape.js');

const app = express();


app.use(bodyParser.urlencoded({extended: false}));

app.get('/*', (req, res) => {
    scrape(req, res, console.log('Scraping'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log('listening');
});