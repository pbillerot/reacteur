'use strict';

import React from 'react';
import { Link, browserHistory } from 'react-router';
// W3
const {Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import Dico from '../config/Dico.js';

export default class PageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            table: this.props.params.table,
            view: this.props.params.view,
            form: this.props.params.form,
            id: this.props.params.id
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }

    render() {
        return (
            <div className="w3-main w3-padding-64">
                <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                    <Link to={'/view/' + this.state.table + '/' + this.state.view}>
                        <i className="fa fa-arrow-left w3-opennav w3-xlarge w3-margin-left w3-margin-right"
                            title="retour"
                            ></i>
                    </Link>
                    <span id="myIntro">{Dico.tables[this.state.table].forms[this.state.form].title}</span>
                </div>
                <Card >
                    <Form {...this.state} />
                </Card>
                <Footer ctx={this}>
                    <p>{Dico.application.copyright}</p>
                </Footer>
            </div>
        )
    }
}

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: this.props.table,
            view: this.props.view,
            form: this.props.form,
            id: this.props.id,
            row_key: Dico.tables[this.props.table].key,
            rubs: Dico.tables[this.props.table].rubs,
            cols: Dico.tables[this.props.table].views[this.props.view].rubs,
            fields: Dico.tables[this.props.table].forms[this.props.form].rubs,
            row: [],
            is_error: false,
            errors: []
        }
        this.onEditRow = this.onEditRow.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    onEditRow(key, value) {
        //console.log(key, value)
        //Dico.tables[this.props.table].forms[this.props.form].rubs[key].value = value
        this.state.fields[key].value = value
        this.setState({})
    }
    handleSubmit() {
        //console.log('handleSubmit: ', this.state.fields)
        this.updateData()
    }
    updateData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            if (!Dico.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/form/' + this.state.table + '/' + this.state.view + '/' + this.state.form + '/' + this.state.id, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: data
        }).then(res => {
            console.log('res: ', res);
            if (res.ok == true) {
                this.state.errors.push(res.statusText)
                this.setState({ is_error: true })
                //console.log('OK: ', res);
                //browserHistory.push('/view/' + this.state.table + '/' + this.state.view);
            } else {
                //console.log('ERR: ', res)
                this.state.errors.push(res.statusText)
                this.setState({ is_error: true })

                // {type: "basic", url: "http://localhost:3333/api/form/USERS/VUE_1/FORM_1/DIXSOIXANTE", status: 500, ok: false, statusText: "Internal Server Error"
            }
        }).catch(err => {
            // ne fonctionne pas
            console.log('ERR: ', err)
        })

    }
    getData(table, view, form, id) {
        //console.log('Form.getData: ', table, view, form, id)
        fetch('/api/form/' + table + '/' + view + '/' + form + '/' + id)
            .then(response => {
                response.json().then(json => {
                    let row = JSON.parse(json)
                    Object.keys(JSON.parse(json)).forEach(key => {
                        //console.log('Form.response: ', key, row[key].value)
                        this.state.fields[key].value = row[key].value ? row[key].value : ''
                    })
                    this.setState({})
                })
            })
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Form.componentWillReceiveProps', nextProps.params)
        if (nextProps.params)
            this.getData(nextProps.params.table, nextProps.params.view, nextProps.params.form, nextProps.params.id)
    }
    componentDidMount() {
        //console.log('Form.componentDidMount...')
        this.getData(this.state.table, this.state.view, this.state.form, this.state.id)
    }

    render() {
        return (
            <form>
                {this.state.is_error &&
                    this.state.errors.map(error => {
                        <div className="w3-panel w3-pale-red w3-leftbar w3-border-red">
                            {this.state.error}
                        </div>
                    })
                }
                {
                    Object.keys(this.state.fields).map(key =>
                        <Field {...this.state} key={key} id={key}
                            value={this.state.fields[key].value}
                            onEditRow={this.onEditRow}
                            handleSubmit={this.handleSubmit}
                            />
                    )
                }
                <div className="w3-navbar"
                    style={{ position: 'fixed', top: '13px', right: '16px', zIndex: 3000 }}>
                    <button type="button" className="w3-btn w3-teal"
                        onClick={this.handleSubmit} >
                        <i className="fa fa-check"></i> Enregistrer
                    </button>
                </div>
            </form>
        )
    }
}

class Field extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e) {
        //console.log('Field.handleChange: ', this.props.id, e.target.value)
        //this.props.fields[this.props.id].value = e.target.value
        this.setState({ value: e.target.value })
        this.props.onEditRow(this.props.id, e.target.value)
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Field.componentWillReceiveProps: ', this.props.id, nextProps.fields[nextProps.id].value)
        //this.setState({ value: nextProps.fields[this.props.id].value })
        this.state.value = nextProps.fields[nextProps.id].value
    }
    // componentDidMount() {
    //     console.log('Field.componentDidMount...')
    // }

    render() {
        //console.log('fields:', this.props.fields, this.props.id, this.props.fields[this.props.id].value)
        switch (this.props.rubs[this.props.id].type) {
            case 'text':
                return (
                    <div className="w3-margin-top">
                        <label className="w3-label">{this.props.rubs[this.props.id].label_long}</label>
                        <input className="w3-input w3-border" required type="text"
                            onChange={this.handleChange}
                            value={this.state.value}
                            />
                    </div>
                )
            case 'email':
                return (
                    <div className="w3-margin-top">
                        <label className="w3-label">{this.props.rubs[this.props.id].label_long}</label>
                        <input className="w3-input w3-border" type="email"
                            onChange={this.handleChange}
                            value={this.state.value}
                            />
                    </div>
                )
            case 'button':
                return (
                    <button className="w3-btn">{this.props.rubs[this.props.id].label_long}</button>
                )
            default:
                return <div>{this.props.id}.type {this.props.rubs[this.props.id].type}not found</div>
        }
    }

}