'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
// W3
const { Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window } = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';
import ContainerView from './ContainerView';

import { Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_data_recepted: false,
            w3_sidebar_open: false,
            app: this.props.params.app,
            table: this.props.params.table,
            view: this.props.params.view,
            is_error: false,
            error: {
                code: '',
                message: ''
            },
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
    componentWillReceiveProps(nextProps) {
        //console.log('PageView.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.setState({
                app: nextProps.params.app,
                table: nextProps.params.table,
                view: nextProps.params.view,
            })
        } else {
            this.setState({
                app: nextProps.app,
                table: nextProps.table,
                view: nextProps.view,
            })
        }
    }
    componentDidMount() {
        //console.log('PageView.componentDidMount...')
        this.state.is_data_recepted = false
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    //console.log('PageView SESSION: ', json)
                    this.state.is_data_recepted = true

                    // Recup des données de la session
                    this.state.ctx.session = json.session
                    
                    // load du dico de l'application
                    let dico_app = require('../config/dico/' + this.state.app + '/' + this.state.app + '.js')
                    Dico.apps[this.state.app] = dico_app
                    
                    this.setState({})
                    ToolsUI.showAlert(this.state.ctx.session.alerts)
                })
            })
    }

    render() {
        //console.log("PageView.render", this.state, Dico.apps[this.state.app])
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]
            && this.state.is_data_recepted) {

            let app = this.state.app
            let table = this.state.table
            let view = this.state.view
            return (
                <div>
                    <ContainerSidebar page={this} {...this.state} {...this.props} />
                    <ContainerContent>
                        <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                            <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
                                onClick={(e) => this.handlePage({ w3_sidebar_open: true })}
                            ></i>
                            <span id="myIntro">{Dico.apps[app].tables[table].views[view].title}</span>
                        </div>

                        {this.state.is_error &&
                            <div className="w3-margin w3-panel w3-pale-red w3-leftbar w3-border-red">
                                <p>{this.state.error.code} {this.state.error.message}</p>
                            </div>
                        }
                        {!this.state.is_error &&
                            <Card>
                                <ContainerView {...this.props} ctx={this.state.ctx}
                                    app={app} table={table} view={view}
                                />
                            </Card>
                        }
                        <Footer>
                            <p>{Dico.application.copyright}</p>
                        </Footer>
                    </ContainerContent>
                    <Alerter />
                </div>
            )
        } else {
            return (
                <div className="w3-margin w3-panel w3-leftbar ">
                    <p>Veuillez patienter...</p>
                </div>
            )
        }
    }
}
