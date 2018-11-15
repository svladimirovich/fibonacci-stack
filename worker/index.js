const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index) {
    if(index < 2)
        return 1;
    else
        return fib(index - 2) + fib(index - 1); 
}

sub.on('message', (channel, message) => {
    console.log("Picking up value: " + message);
    let calculatedValue = fib(parseInt(message));
    redisClient.hset('values', message, calculatedValue);

    console.log(`Calculated fibonacci value ${message} for ${calculatedValue}`);

});

sub.subscribe('insert');