const Queue = require('./queue');
const fs = require('fs');

class Subscriber extends Queue {
    constructor() {
        super();
    }

    waitForRandomNumber () {
        this.client.blpop(this.queueKey, 0, (err, data) => {
            if (err === null) {
                const now = new Date();
                const file = fs.appendFile('./logs/success.log', `[${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}    ${Object.values(data)[1]}     pid:${process.pid}]\n`, (err, data) => {
                    if (err) {
                        console.error(err);
                    }
                });
                this.waitForRandomNumber();
            }
        });
    }
}

module.exports = Subscriber;