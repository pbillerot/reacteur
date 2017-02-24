'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
// W3
const {Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';
import ContainerView from './ContainerView';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            app: this.props.params.app,
            table: this.props.params.table,
            view: this.props.params.view,
            is_error: false,
            error: {
                code: '',
                message: ''
            }
        }
        ctx.elements = {}
    }

    componentWillReceiveProps(nextProps) {
        console.log('PageView.componentWillReceiveProps', nextProps)
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
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    //console.log('PageApp SESSION: ', json)
                    ctx.session = json
                    ToolsUI.showAlert(ctx.session.alerts)
                })
            })
    }

    render() {
        //console.log("PageView.render", this.state)
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]) {

            let app = this.state.app
            let table = this.state.table
            let view = this.state.view
            return (
                <div>
                    <ContainerSidebar apex={this} {...this.props} />
                    <ContainerContent apex={this}>
                        <Header title={Dico.apps[app].tables[table].views[view].title} apex={this} />
                        {this.state.is_error &&
                            <div className="w3-margin w3-panel w3-pale-red w3-leftbar w3-border-red">
                                <p>{this.state.error.code} {this.state.error.message}</p>
                            </div>
                        }
                        {!this.state.is_error &&
                            <ContainerView
                                app={app} table={table} view={view}
                            />
                        }
                        <Footer apex={this}>
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
