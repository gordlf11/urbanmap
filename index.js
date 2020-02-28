let express = require('express');
let app = express();
let cors = require('cors')
let fetch = require('node-fetch');
const Datastore = require('nedb');
//require('@google-cloud/debug-agent').start();

require('dotenv').config()

console.log(process.env)

app.use(cors())

app.listen(3000, () => console.log('listening at port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb'}));


app.post('/data', (request, response) =>{
    console.log('i have a request');
    console.log(request);
});

const incomebase = new Datastore('income.db');
incomebase.loadDatabase();


app.get('/income', async (request, response) => {
    const api_url = 'https://api.bls.gov/publicAPI/v2/timeseries/data/LEU0252881500'
    //const api_url = 'https://api.darksky.net/forecast/abeffc41820fb5d73afdcdf1234c12df/37.8267,-122.4233'
    const income = await fetch(api_url);
    const json = await income.json();
    response.json(json.Results.series[0].data[0]);

    console.log(json.Results.series[0].data[0]);
    incomebase.insert(json);
});

const popbase = new Datastore('pop.db');
popbase.loadDatabase();


app.get('/pop', async (request, response) => {
    const api_key = process.env.API_KEY;
    const pop_url = `https://api.census.gov/data/2010/dec/sf1?get=P001001,NAME&for=us:*&key=${api_key}`;
    //const api_url = 'https://api.darksky.net/forecast/abeffc41820fb5d73afdcdf1234c12df/37.8267,-122.4233'
    const pop = await fetch(pop_url);
    const json = await pop.json();
    response.json(json[1][0]);

    console.log(json[1][0]);
    popbase.insert(json);
});

app.get('/black', async (request, response) => {
    const black_url = 'https://api.census.gov/data/2018/acs/acls?get=NAME,group(B02003)&for=us:1:&key=${api_key}'
    //const api_url = 'https://api.darksky.net/forecast/abeffc41820fb5d73afdcdf1234c12df/37.8267,-122.4233'
    const black = await fetch(black_url);
    const json = await black.json();
    response.json(json);

    console.log(json);
});

const database = new Datastore('database.db');
database.loadDatabase();
// database.insert({name: 'Larry',status:'We Good'})

app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            console.log(err)
            return;
        }
        response.json(data);
        console.log('database data')
    });
});

app.post('/api', (request, response) =>  {

    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);
    console.log(database);
    response.json({
        status:'success',
        timestamp: timestamp,
        latitude: data.lat,
        longitude: data.lon,
    });
});




/*fetch().then( response => {
    console.log(response); 
    return response.json();
    
})*/