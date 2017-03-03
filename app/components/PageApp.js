'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link, browserHistory } from 'react-router';
const Markdown = require('react-remarkable')

// W3
const {Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PageApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            markdown: '',
            app: this.props.params.app
        }
        this.handlePage = this.handlePage.bind(this);
    }
    handlePage(obj) {
        this.setState(obj)
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        if (Dico.apps[this.state.app]) {
            fetch('/api/session', { credentials: 'same-origin' })
                .then(response => {
                    response.json().then(json => {
                        ctx.session = json
                        fetch('/api/help/' + this.state.app, { credentials: 'same-origin' })
                            .then(response => {
                                var contentType = response.headers.get("content-type");
                                if (contentType && contentType.indexOf("application/json") !== -1) {
                                    response.json().then(json => {
                                        // traitement du JSON
                                        //console.log('PageApp SESSION: ', json)
                                        ToolsUI.showAlert(ctx.session.alerts)
                                        this.setState(json)
                                    })
                                } else {
                                    response.text().then(text => {
                                        // traitement du JSON
                                        //console.log('response: ', text)
                                        ToolsUI.showAlert(ctx.session.alerts)
                                        this.setState({ markdown: text })
                                    })
                                }
                            })
                    })
                })
        }
    }
    componentWillReceiveProps(nextProps) {
        //console.log('PageForm.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.setState({
                app: nextProps.params.app,
            })
        }
    }

    render() {
        //console.log("PageApp", this.state)
        if (Dico.apps[this.state.app]) {
            return (
                <div>
                    <ContainerSidebar page={this} {...this.state} {...this.props}  />
                    <ContainerContent>
                        <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                            <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
                                onClick={(e) => this.handlePage({ w3_sidebar_open: true })}
                            ></i>
                            <span id="myIntro">{Dico.apps[this.state.app].desc}</span>
                        </div>
                        <Card style={{ width: '100%', margin: 'auto' }}>
                            {<Markdown source={this.state.markdown} />}
                        </Card>
                        <Footer>
                            <p>{Dico.application.copyright}</p>
                        </Footer>
                    </ContainerContent>
                    <Alerter />
                </div>
            )
        } else {
            return (
                <div className="w3-margin w3-panel w3-pale-red w3-leftbar w3-border-red">
                    <p>404 Page non trouvée</p>
                </div>
            )
        }
    }
}
