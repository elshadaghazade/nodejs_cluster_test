class SubprocWrapper {
    constructor(subproc) {
        this.subproc = subproc;
        this.isMaster = false;
        this.error = null;

        this.subproc.on('message', msg => {
            switch(msg.action) {
                case 'isMaster':
                    this.isMaster = !!msg.data;
                    break;
            }
        })
        .on('error', error => {
            this.error = error;
        });
    }

    setMaster (data=true) {
        this.subproc.send({
            action: 'isMaster',
            data
        });
    }

    exit () {
        this.subproc.send({
            action: 'exit'
        });
    }

    isDead () {
        const { killed, exitCode } = this.subproc;
        return killed || exitCode !== null;
    }

    getPid () {
        return this.subproc.pid;
    }
}

module.exports = {
    SubprocWrapper
}