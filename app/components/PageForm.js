'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link, browserHistory } from 'react-router';
// W3
const {Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { Dico } from '../config/Dico';

export default class PageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            action: this.props.params.action, // add view edit delete ident
            table: this.props.params.table,
            view: this.props.params.view,
            form: this.props.params.form,
            id: this.props.params.id,
            formulaire: Dico.tables[this.props.params.table].forms[this.props.params.form],
            MyForm: () => <Form {...this.state} />
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }
    handleBack(e) {
        e.preventDefault()
        browserHistory.goBack()
    }

    componentWillReceiveProps(nextProps) {
        //console.log('PageForm.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.setState({
                action: nextProps.params.action,
                table: nextProps.params.table,
                view: nextProps.params.view,
                form: nextProps.params.form,
                id: nextProps.params.id,
                formulaire: Dico.tables[nextProps.params.table].forms[nextProps.params.form],
                MyForm: () => <Form {...this.state} />
            })
        }
    }
    render() {
        let title = Dico.tables[this.state.table].forms[this.state.form].title
        const MyForm = this.state.MyForm;
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this}>
                    <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                        <a onClick={this.handleBack}>
                            <i className="fa fa-arrow-left w3-opennav w3-xlarge w3-margin-right"
                                title="retour"
                                ></i>
                        </a>
                        <span id="myIntro">{title}</span>
                    </div>
                    <Card >
                        <MyForm />
                    </Card>
                    <Footer ctx={this}>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
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
            cols: Dico.tables[this.props.table].views[this.props.view].cols,
            fields: Dico.tables[this.props.table].forms[this.props.form].fields,
            formulaire: Dico.tables[this.props.table].forms[this.props.form],
            is_form_valide: false,
            is_read_only: false,
            is_error: false,
            error: {
                code: '',
                message: ''
            },
        }
        Dico.fields = this.state.fields
        this.onEditRow = this.onEditRow.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    checkFormulaire() {
        this.state.is_form_valide = true;
        if (this.state.action == 'view' || this.state.action == 'delete')
            this.state.is_read_only = true

        Object.keys(this.state.fields).forEach(key => {
            // read only
            if (this.state.is_read_only)
                this.state.fields[key].is_read_only = true
            // valeur par défaut
            if (this.state.fields[key].value == '') {
                if (this.state.rubs[key].default)
                    this.state.fields[key].value = this.state.rubs[key].default
            }
            // Field valide ?
            if (!this.state.fields[key].is_read_only && !this.state.fields[key].is_hidden) {
                //console.log(key, this.state.fields[key])
                if (this.state.fields[key].is_valide == false) {
                    this.state.is_form_valide = false
                }
            }
        })
    }

    onEditRow(key, value) {
        //console.log(key, value)
        //Dico.tables[this.props.table].forms[this.props.form].rubs[key].value = value
        this.state.fields[key].value = value
        if (!this.state.fields[key].is_read_only && !this.state.fields[key].is_hidden) {
            this.state.fields[key].is_valide = this.state.rubs[key].is_valide(value)
        }

        this.checkFormulaire()

        this.setState({})
    }

    handleSubmit() {
        // Contrôle du formulaire
        if (this.state.formulaire.check && this.state.formulaire.check(this.state.fields) == false) {
            this.state.error = {
                code: 4100,
                message: 'Formulaire non conforme'
            }
            this.setState({})
            return
        }

        // calcul des champs calculés
        Object.keys(this.state.fields).forEach(key => {
            if (this.state.fields[key].compute) {
                this.state.fields[key].value =
                    this.state.fields[key].compute(this.state.fields[key].value, this.state.fields)
            }
        })

        if (this.state.action == 'edit') {
            this.updateData()
        }
        if (this.state.action == 'add') {
            this.insertData()
        }
        if (this.state.action == 'delete') {
            this.deleteData()
        }
        if (this.state.action == 'ident') {
            this.identData()
        }
    }

    getData(action, table, view, form, id) {
        //console.log('Form.getData: ', action, table, view, form, id)
        Object.keys(this.state.fields).forEach(key => {
            this.state.fields[key].value = ''
            this.state.fields[key].is_valide = false
        })
        if (action == 'view' || action == 'edit' || action == 'delete') {
            fetch('/api/form/' + table + '/' + view + '/' + form + '/' + id, { credentials: 'same-origin' })
                .then(response => {
                    response.json().then(json => {
                        let row = JSON.parse(json)
                        Object.keys(JSON.parse(json)).forEach(key => {
                            //console.log('Form.response: ', key, row[key].value)
                            this.state.fields[key].value = row[key].value ? row[key].value : ''
                            this.state.fields[key].is_valide =
                                this.state.rubs[key].is_valide
                                    ? this.state.rubs[key].is_valide(this.state.fields[key].value)
                                    : true
                        })
                        this.checkFormulaire()
                        this.setState({})
                    })
                })
        }
        if (action == 'add') {
            this.checkFormulaire()
            this.setState({})
        }
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Form.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.getData(nextProps.params.action, nextProps.params.table, nextProps.params.view, nextProps.params.form, nextProps.params.id)
            Object.keys(this.state.fields).forEach(key => {
                this.state.fields[key].is_valide =
                    this.state.rubs[key].is_valide
                        ? this.state.rubs[key].is_valide(this.state.fields[key].value)
                        : true
            })
            this.checkFormulaire()
        } else {
            this.setState({
                action: nextProps.action,
                table: nextProps.table,
                view: nextProps.view,
                form: nextProps.form,
                id: nextProps.id,
                row_key: Dico.tables[nextProps.table].key,
                rubs: Dico.tables[nextProps.table].rubs,
                cols: Dico.tables[nextProps.table].views[nextProps.view].cols,
                fields: Dico.tables[nextProps.table].forms[nextProps.form].fields,
                formulaire: Dico.tables[nextProps.table].forms[nextProps.form],
            })
            Dico.fields = this.state.fields
            this.getData(nextProps.action, nextProps.table, nextProps.view, nextProps.form, nextProps.id)
            this.checkFormulaire()
        }
    }
    componentDidMount() {
        //console.log('Form.componentDidMount...', this.state)
        this.getData(this.state.action, this.state.table, this.state.view, this.state.form, this.state.id)
        Object.keys(this.state.fields).forEach(key => {
            this.state.fields[key].is_valide =
                this.state.rubs[key].is_valide
                    ? this.state.rubs[key].is_valide(this.state.fields[key].value)
                    : true
        })
        this.checkFormulaire()
    }

    identData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            if (!Dico.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/cnx/ident', {
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
                        browserHistory.push('/');
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

    updateData() {
        let data = ''
        Object.keys(this.state.fields).forEach(key => {
            let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
            data += data.length > 0 ? '&' + param : param
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
                        if (this.state.formulaire.return_url) {
                            browserHistory.push(this.state.formulaire.return_url)
                        } else {
                            browserHistory.goBack()
                        }
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
            let param = key + '=' + encodeURIComponent(this.state.fields[key].value)
            data += data.length > 0 ? '&' + param : param
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
                        if (this.state.formulaire.return_url) {
                            browserHistory.push(this.state.formulaire.return_url)
                        } else {
                            browserHistory.goBack()
                        }
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
        let list_fields = []
        Object.keys(this.state.fields).forEach(key => {
            let is_ok = true
            // if (this.state.fields[key].is_hidden)
            //     is_ok = false
            if (is_ok)
                list_fields.push(key)
        })
        return (
            <form>
                {this.state.is_error &&
                    <div className="w3-panel w3-pale-red w3-leftbar w3-border-red">
                        <p>{this.state.error.code} {this.state.error.message}</p>
                    </div>
                }
                {
                    list_fields.map(key =>
                        <div className="w3-row-padding w3-margin-top" key={key}>
                            <Label {...this.state} id={key} />
                            <div className="w3-threequarter">
                                <Field {...this.state} id={key}
                                    value={this.state.fields[key].value}
                                    onEditRow={this.onEditRow}
                                    />
                                <Error {...this.state} id={key} />
                                <Help {...this.state} id={key} />
                            </div>
                        </div>
                    )
                }
                <div className="w3-navbar"
                    style={{ position: 'fixed', top: '13px', right: '16px', zIndex: 3000 }}>
                    {this.state.action == 'ident' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> {this.state.formulaire.action_title
                                ? this.state.formulaire.action_title : 'Valider'}
                        </button>
                    }
                    {this.state.action == 'edit' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> {this.state.formulaire.action_title 
                                ? this.state.formulaire.action_title : 'Enregistrer'}
                        </button>
                    }
                    {this.state.action == 'add' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> {this.state.formulaire.action_title
                                ? this.state.formulaire.action_title : 'Ajouter'}
                        </button>
                    }
                    {this.state.action == 'delete' &&
                        <button type="button"
                            className={this.state.is_form_valide ? 'w3-btn w3-teal' : 'w3-btn w3-teal w3-disabled'}
                            onClick={this.handleSubmit} >
                            <i className="fa fa-check"></i> {this.state.formulaire.action_title
                                ? this.state.formulaire.action_title : 'Supprimer'}
                        </button>
                    }
                </div>
            </form>
        )
    }
}

class Label extends React.Component {
    render() {
        //console.log('render', this.props)
        if (!this.props.fields[this.props.id].is_hidden) {
            switch (this.props.rubs[this.props.id].type) {
                case 'button':
                case 'check':
                case 'link':
                case 'note':
                    return (
                        <span>
                            <label htmlFor={this.props.id} className="w3-label w3-quarter w3-right-align w3-hide-small" >
                                {String.fromCharCode(8239)}</label>
                            <label htmlFor={this.props.id} className="w3-label w3-quarter w3-right-align w3-hide-medium w3-hide-large" >
                                {String.fromCharCode(8239)}</label>
                        </span>
                    )
                default:
                    return (
                        <span>
                            <label htmlFor={this.props.id} className="w3-label w3-quarter w3-right-align w3-hide-small" >
                                {this.props.rubs[this.props.id].label_long}</label>
                            <label htmlFor={this.props.id} className="w3-label w3-quarter w3-left-align w3-hide-medium w3-hide-large" >
                                {this.props.rubs[this.props.id].label_long}</label>
                        </span>
                    )
            }
        } else {
            // Field hidden
            return (
                null
            )
        }
    }
}
class Error extends React.Component {
    render() {
        //console.log('render', this.state)
        if (!this.props.fields[this.props.id].is_hidden) {
            switch (this.props.rubs[this.props.id].type) {
                default:
                    return (
                        <div className="w3-label w3-text-red w3-small" >
                            {!this.props.fields[this.props.id].is_valide && this.props.rubs[this.props.id].error &&
                                <span>{this.props.rubs[this.props.id].error}</span>}
                        </div>
                    )
            }
        } else {
            // Field hidden
            return (
                null
            )
        }
    }
}
class Help extends React.Component {
    render() {
        //console.log('render', this.state)
        if (!this.props.fields[this.props.id].is_hidden) {
            switch (this.props.rubs[this.props.id].type) {
                default:
                    return (
                        <div className="w3-label w3-small" >
                            {this.props.rubs[this.props.id].help && this.props.rubs[this.props.id].help &&
                                <span>{this.props.rubs[this.props.id].help}</span>}
                        </div>
                    )
            }
        } else {
            // Field hidden
            return (
                null
            )
        }
    }
}

class Field extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleButton = this.handleButton.bind(this);
    }
    handleButton(e) {
        //console.log('handleButton', this.props.rubs[this.props.id].action_url)
        browserHistory.push(this.props.rubs[this.props.id].action_url)
        //this.props.handleRefresh()
        //this.setState({})
    }
    handleChange(e) {
        //console.log('Field.handleChange: ', this.props.id, e.target.value)
        this.state.value = this.props.rubs[this.props.id].type == 'check'
            ? this.state.value == '1' ? '0' : '1'
            : e.target.value
        this.setState({})
        this.props.onEditRow(this.props.id, this.state.value)
        //console.log('handleChange', this.state)
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Field.componentWillReceiveProps', nextProps)
        this.state.value = nextProps.fields[nextProps.id].value
    }
    componentDidMount() {
        //console.log('Field.componentDidMount...', this.state, this.props)
    }
    render() {
        //console.log('render', this.state)
        if (!this.props.fields[this.props.id].is_hidden) {
            switch (this.props.rubs[this.props.id].type) {
                case 'button':
                    return (
                        <Link to={this.props.rubs[this.props.id].action_url} className="w3-text-teal"
                            title={this.props.rubs[this.props.id].title}
                            >
                            {this.props.rubs[this.props.id].label_long}
                        </Link>
                    )
                case 'check':
                    return (
                        <span className="">
                            <input className="w3-check" type="checkbox"
                                checked={this.state.value == '1' ? true : false}
                                onChange={this.handleChange}
                                name={this.props.id} id={this.props.id}
                                />
                            <label htmlFor={this.props.id} className="w3-validate">
                                &nbsp;{this.props.rubs[this.props.id].label_long}
                            </label>
                        </span>
                    )
                case 'email':
                    return (
                        <input className="w3-input w3-border" type="email"
                            maxLength={this.props.rubs[this.props.id].maxlength}
                            pattern={this.props.rubs[this.props.id].pattern}
                            placeholder={this.props.rubs[this.props.id].placeholder}
                            onChange={this.handleChange}
                            disabled={this.props.fields[this.props.id].is_read_only}
                            value={this.state.value}
                            id={this.props.id}
                            />
                    )
                case 'link':
                let uri = Dico.replaceParams(this.props.rubs[this.props.id].action_url,
                        this.props.fields)
                    return (
                        <Link to={uri} className="w3-text-teal"
                            title={this.props.rubs[this.props.id].title}
                            >
                            {this.props.rubs[this.props.id].label_long}
                        </Link>
                    )
                case 'password':
                    return (
                        <input className="w3-input w3-border" type="password"
                            maxLength={this.props.rubs[this.props.id].maxlength}
                            pattern={this.props.rubs[this.props.id].pattern}
                            placeholder={this.props.rubs[this.props.id].placeholder}
                            onChange={this.handleChange}
                            disabled={this.props.fields[this.props.id].is_read_only}
                            value={this.state.value}
                            id={this.props.id}
                            />
                    )
                case 'radio':
                    return (
                        <div onChange={this.handleChange} className="w3-padding w3-border" id={this.props.id}>
                            {Object.keys(this.props.rubs[this.props.id].list).map(key =>
                                <span key={key} className="w3-margin-right">
                                    <input className="w3-radio" type="radio"
                                        checked={this.state.value == key}
                                        disabled={this.props.fields[this.props.id].is_read_only}
                                        name={this.props.id} value={key} id={key}
                                        />
                                    <label htmlFor={key} className="w3-validate">
                                        &nbsp;{this.props.rubs[this.props.id].list[key]}
                                    </label>
                                </span>
                            )}
                        </div>
                    )
                case 'select':
                    return (
                        <select className="w3-select w3-border"
                            placeholder={this.props.rubs[this.props.id].placeholder}
                            onChange={this.handleChange}
                            disabled={this.props.fields[this.props.id].is_read_only}
                            value={this.state.value}
                            id={this.props.id}
                            >
                            {Object.keys(this.props.rubs[this.props.id].list).map(key =>
                                <option key={key} value={key}>
                                    {this.props.rubs[this.props.id].list[key]}
                                </option>
                            )}
                        </select>
                    )
                case 'note':
                    return (
                        <div className="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow">
                            <p>{this.props.rubs[this.props.id].note}</p>
                        </div>
                    )
                case 'text':
                    return (
                        <input className="w3-input w3-border" type="text"
                            maxLength={this.props.rubs[this.props.id].maxlength}
                            pattern={this.props.rubs[this.props.id].pattern}
                            placeholder={this.props.rubs[this.props.id].placeholder}
                            onChange={this.handleChange}
                            disabled={this.props.fields[this.props.id].is_read_only}
                            value={this.state.value}
                            id={this.props.id}
                            />
                    )
                default:
                    return <div>{this.props.id}.type {this.props.rubs[this.props.id].type} not found</div>
            }
        } else {
            // Field hidden
            return (
                <input type="text" name={this.props.id} value={this.state.value} style={{ display: 'none' }} />
            )
        }
    }

}