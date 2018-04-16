const express = require('express');
const request = require('request');
const hbs = require('hbs');

const port = process.env.PORT || 8080;

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.get('/results', (request, response) => {
    nquery = response.req.query.query;
    getThumbnails(nquery, (error, results) => {
        console.log('run')
        var thumbs = '';

        for (i = 0; i < results.piclist.length; i++) {

            thumbs += '<img src=' + results.piclist[i] + '><br>';

        }

        response.send(thumbs);

    });
})
app.get('/', (request, response) => {


    response.render('search.hbs')



});

app.get('/weather', (request, response) => {
    nquery = response.req.query.query;

    getWeather(nquery, (errorMessage, results) => {
        if (errorMessage) {
            console.log(errorMessage);
        } else {
            console.log(results.icon);
            global.nicon = '';
            global.nsum = '';

            nicon = results.icon;
            nsum = results.summary;
            getThumbnails(results.icon, (error, results) => {
                picIcon = results.piclist[3]
                global.nimg = '<img src=' + picIcon + '><br>' + nsum;

                response.send(nimg)

            })

        }
    });





})


var getThumbnails = function(query, callback) {
    request({
        url: 'https://pixabay.com/api/?key=7246674-b37ac3e55b379cef1f626bb09&q=' + encodeURIComponent(query) + '&image_type=photo',
        json: true
    }, (error, response, body) => {
        if (error) {
            console.log(error)
            callback("can't connect to pixabay");
        } else if (body.totalHits < 0) {
            callback("no images found");

        } else {

            var piclist = [];
            for (i = 0; i < body.hits.length; i++) {
                try {
                    piclist.push(body.hits[i].largeImageURL)
                } catch (TypeError) {
                    console.log(Error);
                }
            }
            callback(undefined, {
                piclist
            })

            /**
            var piclist = [];
            for (i = 0; i < body.items.length; i++) {
                try {
                    piclist.push(body.items[i].edmPreview[0])
                } catch (TypeError) {
                    console.log(Error);
                }
            }
            if (typeof piclist !== 'undefined' && piclist.length > 0){
                callback(null, piclist);
            } else {
                callback('No images found');
            }
            
        } else {callback('No images found');}
**/
        };

    })
}


function getWeather(coord, callback) {
    request({
        url: 'https://api.darksky.net/forecast/7ef3300d64dd59e230ad77437ca2a654/' + coord,
        json: true
    }, (error, response, body) => {
        if (error) {
            console.log(error)
            callback("can't connect to darksky api");

        } else if (body.status == 'The given location is invalid.') {
            callback("can't find requested address");

        } else {
            callback(undefined, {
                icon: body.currently.icon,
                summary: body.daily.summary
            })
        }
    })
};




app.listen(port, () => {
    console.log(`Server is up on the port ${port}`);

});