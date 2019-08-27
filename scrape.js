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

const scrape = (req, res, newPath = undefined, attemptCount = 0, next) => { //request and response from express (user), new path for redirects, attempt count for reattempts, next for callbacks
    let url = newPath || req.path.split('/')[1];
    //force https request
    https.get(`https://${url}/`, async (response) => {
        //check for redirects
        if(response.statusCode >= 300 && response.statusCode < 400){
            console.log(`Redirect Code Detected: ${response.statusCode} ... attempting redirect.`);
            console.log(`Redirect attempt ${attemptCount} of 50`);
            let redirPath = response.headers.location.split('https://')[1];
            //attempt up to 50 redirect tries, fail with a 503 status
            return attemptCount < 50 ? scrape(req, res, redirPath, attemptCount ++) : res.sendStatus(503);
        }
        console.log(`Incoming Response Headers: ${response.headers}`);
        //generate new file name
        let newFileName = quickFileNameGenerator(url);
        //open write stream to file in scraped_pages directory
        let file = fs.createWriteStream(`./scraped_pages/${newFileName}`);
        //pipe response to file
        let htmlScrape = await response.pipe(file);
        htmlScrape.on('finish', () => { //when finished, send completed file to user
            res.sendFile(path.join(__dirname, `/scraped_pages/${newFileName}`));
        });
    }).on('error', (err) => {
        //send 503 statuses and log for errors.
        res.sendStatus(503);
        console.log(err);
    });
}

module.exports = scrape;