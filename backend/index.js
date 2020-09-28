const conf = require('./conf.json');
const http = require('http');
const { fork } = require('child_process');
const { SubprocWrapper } = require('./app/subproc_wrapper');
const { equal } = require('assert');

// if (conf.nodes instanceof int)

const getNewNode = () => {
    const subproc = new SubprocWrapper(fork('./app/node.js'));

    subproc.subproc
        .on('exit', (code, signal) => {
            resetMasterNode();
            console.log(`Process exited: ${code} ${signal} ${subproc.subproc.pid}`);
        })
        .on('close', (code, signal) => {
            resetMasterNode();
            console.log(`Process close: ${code} ${signal} ${subproc.subproc.pid}`);
        })
        .on('disconnect', () => {
            resetMasterNode();
            console.log(`Process disconnected ${subproc.subproc.pid}`);
        });

        return subproc;
}

const subprocPool = [];

for (let i = 0; i < conf.nodes; i++) {
    subproc = getNewNode();
    subprocPool.push(subproc);

    if (!i) {
        subproc.setMaster(true);
    } else {
        subproc.setMaster(false);
    }
}

const resetMasterNode = () => {
    const procs = subprocPool.filter(proc => {
        return !proc.isDead() && !proc.isMaster;
    });

    if (procs.length) {
        subprocPool.forEach(proc => {
            proc.setMaster(false);
        });

        procs[0].setMaster(true);
    }
}

const listener = (req, res) => {

    if (req.method === 'POST' && req.url === '/api/') {
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            body = JSON.parse(body);

            switch(body.action) {
                case 'add_new_node':
                    subproc = getNewNode();
                    subprocPool.push(subproc);
                    resetMasterNode();

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Credentials': true
                    });

                    res.end(JSON.stringify({
                        error: null,
                        data: 'OK'
                    }));
                    break;
                case 'set_master':
                    subprocPool.forEach(proc => {
                        if (body.pid === proc.getPid() && proc.isMaster) {
                            return;
                        } else if (body.pid === proc.getPid()) {
                            proc.setMaster(true);
                        } else if (proc.isMaster) {
                            proc.setMaster(false);
                        }
                    });

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Credentials': true
                    });

                    res.end(JSON.stringify({
                        error: null,
                        data: 'OK'
                    }));
                    break;
                case 'kill':
                    subprocPool.forEach(proc => {
                        if (body.pid === proc.getPid()) {
                            proc.exit();
                            return;
                        }
                    });
                    
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Credentials': true
                    });

                    res.end(JSON.stringify({
                        error: null,
                        data: 'OK'
                    }));
                    break;
                case 'proc_list':
                    const response = subprocPool.map(proc => {
                        return {
                            isDead: proc.isDead(),
                            pid: proc.getPid(),
                            isMaster: proc.isMaster
                        }
                    });

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Credentials': true
                    });

                    res.end(JSON.stringify(response));
                    break;
            }
        });
    } else if (req.method === 'GET') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': true
        });
        res.end('Hello World!');
    }
}

const server = http.createServer(listener);
server.listen(port=conf.port, hostname='0.0.0.0');