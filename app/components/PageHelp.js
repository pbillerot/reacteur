'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
const Markdown = require('react-remarkable')
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import { Data, Dico } from '../config/Dico';
import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';
//const fs = require('fs')

export default class PageHelp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false
        }
    }
    handlerCtx(obj) {
        //console.log('handlerCtx: ', obj)
        this.setState(obj)
    }

    render() {
        //let data = fs.readFileSync(__dirname + '/help.md', 'utf8')
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this} >
                    <Header title="Aide" ctx={this} />
                    <RestAPI />
                    <Footer ctx={this}>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
            </div>
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
        //console.log('componentDidMount...')
        fetch('/api/help', {
            credentials: 'same-origin'
        })
            .then(response => {
                var contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    response.json().then(json => {
                        // traitement du JSON
                        //console.log('response: ', json)
                        this.setState(json)
                    })
                } else {
                    response.text().then(text => {
                        // traitement du JSON
                        //console.log('response: ', text)
                        this.setState({ markdown: text })
                    })
                }
            })
    }
    render() {
        //console.log(this.state.html)
        return (
            <Card style={{ width: '100%', margin: 'auto' }}>
                {<Markdown source={this.state.markdown} />}
            </Card>
        )
    }
}
// { renderHTML('<div>' + this.state.html + '</div>') }