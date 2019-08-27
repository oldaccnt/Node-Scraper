const express= require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));


const quickFileNameGenerator = (url) => {
   return ['com','eu','ca','net','org','edu','ru','io','xxx','biz','me'].indexOf(url.split('.')[1]) === -1 ? `${url.split('.')[1]}.html` : `${url.split('.')[0]}.html`
}

const scrape = (req, res, newPath = undefined, attemptCount = 0, next) => {
    let url = newPath || req.path.split('/')[1];
    console.log(url);

    https.get(`https://${url}/`, async (response) => {
        if(response.statusCode >= 300 && response.statusCode < 400){
            console.log(`Redirect Code Detected: ${response.statusCode} ... attempting redirect.`);
            console.log(`Redirect attempt ${attemptCount} of 50`);
            let redirPath = response.headers.location.split('https://')[1];
            return attemptCount < 50 ? scrape(req, res, redirPath, attemptCount ++) : res.sendStatus(404);
        }
        console.log(`Incoming Response Headers: ${response.headers}`);
        let newFileName = quickFileNameGenerator(url);
        let file = fs.createWriteStream(`./scraped_pages/${newFileName}`);
        let htmlScrape = await response.pipe(file);
        htmlScrape.on('finish', () => {
            res.sendFile(path.join(__dirname, `/scraped_pages/${newFileName}`));
        });
    }).on('error', (err) => {
        res.sendStatus(503);
        console.log(err);
    });
}

module.exports = scrape;