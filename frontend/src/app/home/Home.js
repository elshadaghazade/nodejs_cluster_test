import React, { Component } from 'react';
import conf from '../../conf.json';
import {
    Container,
    Jumbotron,
    Col,
    Row,
    Table,
    Button,
    ButtonGroup,
    InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

class Home extends Component {
    constructor() {
        super();

        this.state = {
            procList: []
        }
    }

    loadNodes() {
        axios.post(conf.api_url, {
            action: 'proc_list'
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                this.setState({
                    procList: response.data
                })
            })
            .catch(err => console.log("ERROR", err));
    }

    componentDidMount() {
        this.loadNodes();
    }

    reloadCB() {
        this.loadNodes();
    }

    killProcCB(pid) {
        if (!window.confirm('Are you sure to kill the node?')) {
            return false;
        }

        axios.post(conf.api_url, {
            action: 'kill',
            pid
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                this.loadNodes();
            })
            .catch(err => console.log("ERROR", err));
    }

    setAsMaster(pid) {
        axios.post(conf.api_url, {
            action: 'set_master',
            pid
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                this.loadNodes();
            })
            .catch(err => console.log("ERROR", err));
    }

    addNewNode() {
        axios.post(conf.api_url, {
            action: 'add_new_node',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                this.loadNodes();
            })
            .catch(err => console.log("ERROR", err));
    }

    render() {
        return (
            <Container>
                <Jumbotron>
                    <h1>NODE.JS CLUSTERDS</h1>
                    <p>You can add new node or kill existings. Also you can change master node manually.</p>
                </Jumbotron>
                <Row>
                    <Col xs={12}>
                        <ButtonGroup>
                            <Button variant="primary" onClick={this.reloadCB.bind(this)}>RELOAD</Button>
                            <Button variant="success" onClick={this.addNewNode.bind(this)}>ADD NEW NODE</Button>
                        </ButtonGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>#</th>
                                    <th>PID</th>
                                    <th>TYPE</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.procList.filter(proc => !proc.isDead).map((proc, index) => (
                                    <tr key={`table-proc-td-${index}`}>
                                        <td>{index}</td>
                                        <td>{proc.pid}</td>
                                        <td>{proc.isMaster ? 'Master' : 'Worker'}</td>
                                        <td style={{ width: 250 }}>
                                            <ButtonGroup>
                                                <Button variant="danger" onClick={() => this.killProcCB(proc.pid)}>KILL</Button>
                                                <Button variant="warning" onClick={() => this.setAsMaster(proc.pid)}>SET AS MASTER</Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Home;