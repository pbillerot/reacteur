'use strict';

import React from 'react';
import 'whatwg-fetch';
import { Link, browserHistory } from 'react-router';

import Select from 'react-select';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';

// W3
const {Alerter, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';
import ContainerForm from './ContainerForm';

import { Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class PageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            action: this.props.params.action, // add view edit delete ident
            app: this.props.params.app,
            table: this.props.params.table,
            view: this.props.params.view,
            form: this.props.params.form,
            id: this.props.params.id,
            //MyForm: () => <ContainerForm {...this.state} />,
            ctx: {
                elements: {},
                session: {},
            }
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }
    handleBack(e) {
        e.preventDefault()
        browserHistory.goBack()
    }
    componentDidMount() {
        //console.log('PageForm.componentDidMount...')
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    this.state.ctx.session = json
                    this.setState({ })
                    ToolsUI.showAlert(this.state.ctx.session.alerts)
                })
            })
    }

    componentWillReceiveProps(nextProps) {
        //console.log('PageForm.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.setState({
                action: nextProps.params.action,
                app: nextProps.params.app,
                table: nextProps.params.table,
                view: nextProps.params.view,
                form: nextProps.params.form,
                id: nextProps.params.id,
                //MyForm: () => <Form {...this.state} />
            })
        }
    }
    render() {
        //console.log("PageForm", this.state)
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]
            && Dico.apps[this.state.app].tables[this.state.table].forms[this.state.form]
            && this.state.ctx.session.host && this.state.ctx.session.host.length > 3) {
            let title = Dico.apps[this.state.app].tables[this.state.table].forms[this.state.form].title
            //const MyForm = this.state.MyForm;
            return (
                <div>
                    <ContainerSidebar {...this.state} {...this.props} />
                    <ContainerContent {...this.props}>
                        <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                            <a onClick={this.handleBack}>
                                <i className="fa fa-arrow-left w3-opennav w3-xlarge w3-margin-right"
                                    title="retour"
                                ></i>
                            </a>
                            <span id="myIntro">{title}</span>
                        </div>
                        <Card >
                            <ContainerForm {...this.state} />
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
                    <p>Wait...</p>
                </div>
            )

        }
    }
}
