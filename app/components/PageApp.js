'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link, browserHistory } from 'react-router';
const Markdown = require('react-remarkable')
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'

export default class PageApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            markdown: '',
            app: this.props.params.app
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }
    componentDidMount() {
        console.log('componentDidMount...')
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
                                        console.log('PageApp SESSION: ', json)
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
                    })
                })
        }
    }
    componentWillReceiveProps(nextProps) {
        console.log('PageForm.componentWillReceiveProps', nextProps)
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
                    <ContainerSidebar apex={this} {...this.props} />
                    <ContainerContent apex={this}>
                        <Header title={Dico.apps[this.state.app].desc} apex={this} />
                        <Card style={{ width: '100%', margin: 'auto' }}>
                            {<Markdown source={this.state.markdown} />}
                        </Card>
                        <Footer apex={this}>
                            <p>{Dico.application.copyright}</p>
                        </Footer>
                    </ContainerContent>
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
// <Card style={{ width: '100%', margin: 'auto' }}>
//     {<Markdown source={this.state.markdown} />}
// </Card>
