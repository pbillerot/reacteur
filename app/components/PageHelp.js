'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
const Markdown = require('react-remarkable')
import Alert from 'react-s-alert';

// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'
import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';
//const fs = require('fs')

export default class PageHelp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false
        }
        this.handlePage = this.handlePage.bind(this);
    }
    handlePage(obj) {
        this.setState(obj)
    }
    render() {
        //let data = fs.readFileSync(__dirname + '/help.md', 'utf8')
        return (
            <div>
                <ContainerSidebar page={this} {...this.state} {...this.props} />
                <ContainerContent apex={this} >
                    <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                        <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
                            onClick={(e) => this.handlePage({ w3_sidebar_open: true })}
                        ></i>
                        <span id="myIntro">Aide</span>
                    </div>

                    <RestAPI />
                    <Footer>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
                <Alert />
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