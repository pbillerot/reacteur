'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link, browserHistory } from 'react-router';
const Markdown = require('react-remarkable')

// W3
const { Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window } = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PageApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_data_recepted: false,
            w3_sidebar_open: false,
            markdown: '',
            app: this.props.params.app,
            ctx: {
                elements: {},
                session: {},
            }
        }
        this.handlePage = this.handlePage.bind(this);
    }
    handlePage(obj) {
        this.setState(obj)
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        this.state.is_data_recepted = false
        fetch('/api/session/' + this.state.app, { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    console.log('PageApp SESSION: ', json)
                    this.state.is_data_recepted = true
                    this.state.ctx.session = json.session
                    Dico.apps[json.appname] = json.app
                    fetch('/api/help/' + this.state.app, { credentials: 'same-origin' })
                        .then(response => {
                            response.text().then(text => {
                                //console.log('response: ', text)
                                ToolsUI.showAlert(this.state.ctx.session.alerts)
                                this.setState({ markdown: text })
                            })
                        })
                })
            })
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
        if (Dico.apps[this.state.app] && this.state.is_data_recepted) {
            return (
                <div>
                    <ContainerSidebar page={this} {...this.state} {...this.props} />
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
                <div className="w3-margin w3-panel w3-leftbar">
                    <p>Veuillez patienter...</p>
                </div>
            )
        }
    }
}
