'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link } from 'react-router';
const Markdown = require('react-remarkable')

// W3
const {Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PagePortail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
        }
        this.handlePage = this.handlePage.bind(this);
    }
    handlePage(obj) {
        this.setState(obj)
    }
    componentDidMount() {
        //console.log('componentDidMount...', this.props.location.pathname)
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    ctx.session = json
                    ToolsUI.showAlert(ctx.session.alerts)
                    this.setState({})
                })
            })

    }
    componentWillReceiveProps(nextProps) {
        //console.log('Form.componentWillReceiveProps', nextProps)
    }
    render() {
        let apps = []
        Object.keys(Dico.apps).map(app => {
            if (Dico.apps[app].group && Dico.apps[app].group.length > 0) {
                if (ctx.session.user_profil == Dico.apps[app].group) {
                    apps.push(app)
                }
            } else {
                apps.push(app)
            }
        })
        //console.log("PagePortail", apps)
        return (
            <div>
                <ContainerSidebar page={this} {...this.state} {...this.props}  />
                <ContainerContent>
                    <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                        <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
                            onClick={(e) => this.handlePage({ w3_sidebar_open: true })}
                        ></i>
                        <span id="myIntro">{Dico.application.desc}</span>
                    </div>
                    <div className="w3-row-padding">
                        {apps.sort().map(app =>
                            <Link style={{ textDecoration: 'none' }} className="w3-col m6 l4 w3-margin-top" to={'/app/' + app} key={app}>
                                <div className="w3-card" >
                                    <header className="w3-container w3-theme-dark">
                                        <h3>{Dico.apps[app].title}</h3>
                                    </header>

                                    <div className="w3-container">
                                        <p>{Dico.apps[app].desc}</p>
                                    </div>

                                    <footer className="w3-container w3-dark-grey">
                                    </footer>
                                </div>
                            </Link>
                        )}
                    </div>
                    <Footer>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
                <Alerter />
            </div>
        )
    }
}
// <Card style={{ width: '100%', margin: 'auto' }}>
//     {<Markdown source={this.state.markdown} />}
// </Card>
