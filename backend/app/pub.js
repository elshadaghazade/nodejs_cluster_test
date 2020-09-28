const conf = require('../conf.json');
const Queue = require('./queue');

class Publisher extends Queue {
    constructor() {
        super();
    }

    startGeneratingRandomNumber () {
        setInterval(() => {
            this.client.rpush(this.queueKey, Math.random(), (err, messageCount) => {
                if (err === null) {
                    // console.log(`${messageCount} random number in queue.`);
                }
            });
        }, conf.wait);
    }
}

module.exports = Publisher;