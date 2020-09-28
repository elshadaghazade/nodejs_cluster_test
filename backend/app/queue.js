const redis = require("redis");

class Queue {

    queueKey = 'random-number';

    constructor() {
        this.client = redis.createClient({
            host: process.env.HOSTNAME || 'localhost',
            port: process.env.PORT || 6379
        });

        this.client.on('error', err => {
            console.log("Redis error:", err);
        });

        this.client.on('connect', () => {
            console.log('Connected');
        });

        this.client.on('ready', () => {
            console.log('Ready');
        });
    }
}

module.exports = Queue;