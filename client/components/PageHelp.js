'use strict';

import React from 'react';
import Fetch from 'react-fetch'
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import Dico from '../../config/Dico.js';
import ContainerContent from './ContainerContent';
//const fs = require('fs')

export default class PageHelp extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        //let data = fs.readFileSync(__dirname + '/help.md', 'utf8')
        return (
            <ContainerContent {...this.props} >
                <Header title="Aide" />
                <RestAPI />
                <Footer>
                    <p>{Dico.application.copyright}</p>
                </Footer>
            </ContainerContent>
        )
    }
}
class RestAPI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            markdown: ''
        }
    }
    componentDidMount() {
        console.log('componentDidMount...')
        fetch('/rest/help')
            .then(response => {
                var contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    response.json().then( json => {
                        // traitement du JSON
                        console.log('response.json:', json)
                        this.setState(json)
                        return json
                    })
                } else {
                    console.log("Oops, nous n'avons pas du JSON!");
                    return response.text()
                }
            })
    }
    render() {
        return (
            <Card style={{ width: '100%', margin: 'auto' }}>
                <p>
                    RESULT: {this.state.markdown}
                </p>
            </Card>
        )
    }
}
//                         {/*<ReactMarkdown source={data} />*/}
