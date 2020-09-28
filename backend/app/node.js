const Publisher = require('./pub');
const Subscriber = require('./sub');

let isMaster = false;
let publisher = null;
let subscriber = null;

process.on('message', msg => {
    switch(msg.action) {
        case 'isMaster':
            isMaster = !!msg.data;

            process.send({
                action: 'isMaster',
                data: isMaster
            });

            if (isMaster) {
                actAsMaster();
            } else {
                actAsWorker();
            }
            break;
        case 'exit':
            process.send({
                action: 'isMaster',
                data: false
            });

            process.exit();
    }
});


const actAsMaster = () => {
    if (publisher instanceof Publisher && publisher) {
        publisher.client.quit();
        publisher = null;
    }

    if (subscriber instanceof Publisher && subscriber) {
        subscriber.client.quit();
        subscriber = null;
    }

    publisher = new Publisher();
    publisher.startGeneratingRandomNumber();
}

const actAsWorker = () => {
    if (publisher instanceof Publisher && publisher) {
        publisher.client.quit();
        publisher = null;
    }

    if (subscriber instanceof Publisher && subscriber) {
        subscriber.client.quit();
        subscriber = null;
    }

    subscriber = new Subscriber();
    subscriber.waitForRandomNumber();
}