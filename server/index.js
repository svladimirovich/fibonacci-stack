const keys = require('./keys');

// Express setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// if calls go through nginx's single domain then we don't need CORS headers
//app.use(cors());
app.use(bodyParser.json());

// Postgress setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});

pgClient.on('error', () => {
    console.log('Postgres error! Closing connection!');
});

pgClient.query(`
CREATE TABLE IF NOT EXISTS values(
    number INT
);
`).catch(error => {
    console.log("Could not create 'values' table: " + error);
});

// Redis setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

//app.options('*', cors());

// my custom CORS handlers
// app.use((request, response, next) => {
//     response.header("Access-Control-Allow-Origin", "*");
//     next();
// });

// app.options("*", (request, response, next) => {
//     response.header("Access-Control-Allow-Origin", "*");
//     response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//     //response.header("Access-Control-Allow-Headers", "Authorization");
//     response.sendStatus(200);
// })

// Express route handlers
app.get('/', (request, response) => {
    response.send('Hi!');
});

app.get('/values/all', (request, response) => {
    const values = pgClient.query('select * from values;').then(result => {
        response.json(result.rows);
    }).catch(error => {
        response.status(500).send("Error querying postgres: " + error);
    })
});

app.get('/values/current', (request, response) => {
    redisClient.hgetall('values', (error, values) => {
        if(error) {
            response.status(500).send("Error calling Redis: " + error);
        } else {
            response.send(values);
        }
    })
});

app.post('/values', (request, response) => {
    const index = request.body.index;

    if(parseInt(index) > 40) {
        response.status(400).send("Error: index too high! I can't calculate fibonacci of such high value! I am incompetent!");
    } else {
        redisClient.hset('values', index, 'Calculating...');
        redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO values(number) VALUES($1);', [index]).then(result => {
            response.json({ working: true });
        }).catch(error => {
            response.status(500).send("Error: could not insert value to postgres!: " + error);
        })
    }
});

app.listen(5000, error => {
    console.log("Express listening on port 5000!");
});