'use strict';

import React from 'react';
import 'whatwg-fetch'
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
            action: this.props.params.action,
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
                        <i className="fa fa-arrow-left w3-opennav w3-xlarge w3-margin-right"
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
            action: this.props.action,
            table: this.props.table,
            view: this.props.view,
            form: this.props.form,
            id: this.props.id,
            row_key: Dico.tables[this.props.table].key,
            rubs: Dico.tables[this.props.table].rubs,
            cols: Dico.tables[this.props.table].views[this.props.view].rubs,
            fields: Dico.tables[this.props.table].forms[this.props.form].rubs,
            is_form_valide: false,
            is_read_only: false,
            is_error: false,
            error: {
                code: '',
                message: ''
            },
        }
        this.onEditRow = this.onEditRow.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    checkFormulaire() {
        this.state.is_form_valide = true;
        if ( this.state.action == 'view' || this.state.action == 'delete' )
            this.state.is_read_only = true

        Object.keys(this.state.fields).forEach(key => {
            // read only
            if ( this.state.is_read_only )
                this.state.fields[key].is_read_only = true
            // valeur par défaut
            if ( this.state.fields[key].value == '' ) {
                if ( this.state.rubs[key].default )
                    this.state.fields[key].value = this.state.rubs[key].default
            }
            // Formulaire valide ?
            if (this.state.fields[key].is_valide != 'undefined' &&
                this.state.fields[key].is_valide == false) {
                this.state.is_form_valide = false
            }
            console.log('checkFormulaire', key, this.state.fields[key])
        })
    }

    onEditRow(key, value) {
        //console.log(key, value)
        //Dico.tables[this.props.table].forms[this.props.form].rubs[key].value = value
        this.state.fields[key].value = value
        this.state.fields[key].is_valide = this.state.rubs[key].is_valide(value)

        this.checkFormulaire()

        this.setState({})
    }
    handleSubmit() {
        // if (!this.state.is_valide) {
        //     this.state.error = {
        //         code: 4100,
        //         message: 'Formulaire non conforme'
        //     }
        //     this.setState({ is_error: true })
        //     return
        // }
        if (this.state.action == 'edit') {
            this.updateData()
        }
        if (this.state.action == 'add') {
            this.insertData()
        }
        if (this.state.action == 'delete') {
            this.deleteData()
        }
    }

    getData(action, table, view, form, id) {
        //console.log('Form.getData: ', action, table, view, form, id)
        Object.keys(this.state.fields).forEach(key => {
            this.state.fields[key].value = ''
            this.state.fields[key].is_valide = false
            this.state.fields[key].is_read_only = false
        })
        if (action == 'edit' || action == 'delete') {
            fetch('/api/form/' + table + '/' + view + '/' + form + '/' + id, { credentials: 'same-origin' })
                .then(response => {
                    response.json().then(json => {
                        let row = JSON.parse(json)
                        Object.keys(JSON.parse(json)).forEach(key => {
                            //console.log('Form.response: ', key, row[key].value)
                            this.state.fields[key].value = row[key].value ? row[key].value : ''
                            this.state.fields[key].is_valide = this.state.rubs[key].is_valide(this.state.fields[key].value)
                        })
                        this.checkFormulaire()
                        this.setState({})
                    })
                })
        }
        if (this.state.action == 'add') {
            this.checkFormulaire()
            this.setState({})
        }
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Form.componentWillReceiveProps', nextProps.params)
        if (nextProps.params) {
            this.getData(nextProps.params.action, nextProps.params.table, nextProps.params.view, nextProps.params.form, nextProps.params.id)
            Object.keys(this.state.fields).forEach(key => {
                this.state.fields[key].is_valide = this.state.rubs[key].is_valide(this.state.fields[key].value)
            })
            this.checkFormulaire()
        }
    }
    componentDidMount() {
        //console.log('Form.componentDidMount...')
        this.getData(this.state.action, this.state.table, this.state.view, this.state.form, this.state.id)
        Object.keys(this.state.fields).forEach(key => {
            this.state.fields[key].is_valide = this.state.rubs[key].is_valide(this.state.fields[key].value)
        })
        this.checkFormulaire()
    }

    updateData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            if (!Dico.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/' + this.state.table + '/' + this.state.view + '/' + this.state.form + '/' + this.state.id, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: data
        }).then(response => {
            //console.log('RESULT: ', response)
            response.json().then(json => {
                if (response.ok == true) {
                    if (json.code < 4000) {
                        browserHistory.push('/view/' + this.state.table + '/' + this.state.view);
                    } else {
                        this.state.error = {
                            code: json.code,
                            message: json.message
                        }
                        this.setState({ is_error: true })
                    }
                } else {
                    this.state.error = {
                        code: json.code,
                        message: json.message
                    }
                    this.setState({ is_error: true })
                }
            })
        })

    }

    deleteData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            if (!Dico.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/' + this.state.table + '/' + this.state.view + '/' + this.state.form + '/' + this.state.id, {
            method: "DELETE",
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: data
        }).then(response => {
            //console.log('RESULT: ', response)
            response.json().then(json => {
                if (response.ok == true) {
                    if (json.code < 4000) {
                        browserHistory.push('/view/' + this.state.table + '/' + this.state.view);
                    } else {
                        this.state.error = {
                            code: json.code,
                            message: json.message
                        }
                        this.setState({ is_error: true })
                    }
                } else {
                    this.state.error = {
                        code: json.code,
                        message: json.message
                    }
                    this.setState({ is_error: true })
                }
            })
        })

    }

    insertData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            if (!Dico.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/' + this.state.table + '/' + this.state.view + '/' + this.state.form, {
            method: "PUT",
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: data
        }).then(response => {
            //console.log('RESULT: ', response)
            response.json().then(json => {
                if (response.ok == true) {
                    if (json.code < 4000) {
                        browserHistory.push('/view/' + this.state.table + '/' + this.state.view);
                    } else {
                        this.state.error = {
                            code: json.code,
                            message: json.message
                        }
                        this.setState({ is_error: true })
                    }
                } else {
                    this.state.error = {
                        code: json.code,
                        message: json.message
                    }
                    this.setState({ is_error: true })
                }
            })
        })

    }

    render() {
        return (
            <form className="w3-padding-16">
                {this.state.is_error &&
                    <div className="w3-panel w3-pale-red w3-leftbar w3-border-red">
                        <p>{this.state.error.code} {this.state.error.message}</p>
                    </div>
                }
                {
                    Object.keys(this.state.fields).map(key =>
                        <div className="w3-row-padding w3-margin-top" key={key}>
                            <label className="w3-label w3-quarter w3-right-align w3-hide-small" >{this.state.rubs[key].label_long}</label>
                            <label className="w3-label w3-quarter w3-left-align w3-hide-medium w3-hide-large" >{this.state.rubs[key].label_long}</label>
                            <div className="w3-threequarter">
                                <Field {...this.state} id={key}
                                    value={this.state.fields[key].value}
                                    onEditRow={this.onEditRow}
                                    handleSubmit={this.handleSubmit}
                                    />
                                <div className="w3-label w3-text-red w3-small" >
                                    {!this.state.fields[key].is_valide && this.state.rubs[key].error &&
                                        <span>{this.state.rubs[key].error}.</span>}
                                </div>
                                <div className="w3-label w3-small" >
                                    {this.state.rubs[key].help && this.state.rubs[key].help &&
                                        <span>{this.state.rubs[key].help}.</span>}
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className="w3-navbar"
                    style={{ position: 'fixed', top: '13px', right: '16px', zIndex: 3000 }}>
                    {this.state.action == 'edit' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> Enregistrer
                        </button>
                    }
                    {this.state.action == 'add' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> Ajouter
                        </button>
                    }
                    {this.state.action == 'delete' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> Supprimer
                        </button>
                    }
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
        this.setState({ value: e.target.value })
        this.props.onEditRow(this.props.id, e.target.value)
    }
    componentWillReceiveProps(nextProps) {
        this.state.value = nextProps.fields[nextProps.id].value
    }

    render() {
        switch (this.props.rubs[this.props.id].type) {
            case 'text':
                return (
                    <input className="w3-input w3-border" type="text"
                        required={this.props.rubs[this.props.id].required}
                        maxLength={this.props.rubs[this.props.id].maxlength}
                        pattern={this.props.rubs[this.props.id].pattern}
                        placeholder={this.props.rubs[this.props.id].placeholder}
                        onChange={this.handleChange}
                        disabled={this.props.fields[this.props.id].is_read_only}
                        value={this.state.value}
                        />
                )
            case 'email':
                return (
                    <input className="w3-input w3-border" type="email"
                        required={this.props.rubs[this.props.id].required}
                        maxLength={this.props.rubs[this.props.id].maxlength}
                        pattern={this.props.rubs[this.props.id].pattern}
                        placeholder={this.props.rubs[this.props.id].placeholder}
                        onChange={this.handleChange}
                        disabled={this.props.fields[this.props.id].is_read_only}
                        value={this.state.value}
                        />
                )
            case 'select':
                return (
                    <select className="w3-select w3-border"
                        required={this.props.rubs[this.props.id].required}
                        placeholder={this.props.rubs[this.props.id].placeholder}
                        onChange={this.handleChange}
                        disabled={this.props.fields[this.props.id].is_read_only}
                        value={this.state.value}
                        >
                        {Object.keys(this.props.rubs[this.props.id].list).map(key =>
                            <option key={key} value={key}>
                                {this.props.rubs[this.props.id].list[key]}
                            </option>
                        )}
                    </select>
                )
            case 'button':
                return (
                    <button className="w3-btn">{this.props.rubs[this.props.id].label_long}</button>
                )
            default:
                return <div>{this.props.id}.type {this.props.rubs[this.props.id].type} not found</div>
        }
    }

}