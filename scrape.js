const express= require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

const scrape = (req, res, newPath = undefined, next) => {
    let url = newPath || req.path.split('/')[1];
    console.log(url);

    https.get(`https://${url}/`, async (response) => {
        if(response.statusCode >= 300 && response.statusCode < 400){
            console.log(response.statusCode)
            let redirPath = response.headers.location.split('https://')[1];
            return scrape(req, res, redirPath);
        }
        console.log(response.headers);
        let file = fs.createWriteStream(`${url.split('.')[0]}.html`);
        let htmlScrape = await response.pipe(file);
        htmlScrape.on('finish', () => {
            res.sendFile(path.join(__dirname,`${url.split('.')[0]}.html`));
        });
    }).on('error', (err) => {
        res.sendStatus(503);
        console.log(err);
    });
}

module.exports = scrape;