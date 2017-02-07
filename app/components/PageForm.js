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

import { ctx, Dico } from '../config/Dico'
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
            MyForm: () => <Form {...this.state} />,
        }
        ctx.elements = {}
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
                app: nextProps.params.app,
                table: nextProps.params.table,
                view: nextProps.params.view,
                form: nextProps.params.form,
                id: nextProps.params.id,
                MyForm: () => <Form {...this.state} />
            })
        }
    }
    render() {
        //console.log("PageForm", this.state)
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]
            && Dico.apps[this.state.app].tables[this.state.table].forms[this.state.form]) {
            let title = Dico.apps[this.state.app].tables[this.state.table].forms[this.state.form].title
            const MyForm = this.state.MyForm;
            return (
                <div>
                    <ContainerSidebar apex={this} {...this.props} />
                    <ContainerContent apex={this}>
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

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            action: this.props.action,
            app: this.props.app,
            table: this.props.table,
            view: this.props.view,
            form: this.props.form,
            id: this.props.id,
            key_name: Dico.apps[this.props.app].tables[this.props.table].key,
            formulaire: Dico.apps[this.props.app].tables[this.props.table].forms[this.props.form],
            is_form_valide: false,
            is_read_only: false,
            is_error: false,
            error: {
                code: '',
                message: ''
            }
        }
        let rubs = Dico.apps[this.props.app].tables[this.props.table].elements
        let fields = Dico.apps[this.props.app].tables[this.props.table].forms[this.props.form].elements
        ctx.element = {}
        Object.keys(fields).forEach(key => {
            ctx.elements[key] = Object.assign({}, rubs[key], fields[key])
        })
        this.onEditRow = this.onEditRow.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkFormulaire = this.checkFormulaire.bind(this);
    }

    onEditRow(key, value) {
        //console.log('onEditRow', key, value)
        ctx.elements[key].value = value
        this.checkFormulaire()
    }

    handleSubmit() {
        // Contrôle du formulaire
        if (this.state.formulaire.is_valide && this.state.formulaire.is_valide() == false) {
            this.state.error = {
                code: 4100,
                message: 'Formulaire non conforme'
            }
            this.setState({})
            return
        }

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

    componentWillReceiveProps(nextProps) {
        //console.log('Form.componentWillReceiveProps', nextProps)
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    ctx.session = json
                    ToolsUI.showAlert(ctx.session.alerts)
                    //console.log('PageForm SESSION: ', json)
                    if (nextProps.params) {
                        this.getData(nextProps.params.action, nextProps.params.app, nextProps.params.table
                            , nextProps.params.view, nextProps.params.form, nextProps.params.id,
                            (result) => {
                                //
                            })
                    } else {
                        this.getData(nextProps.action, nextProps.app, nextProps.table, nextProps.view, nextProps.form, nextProps.id,
                            (result) => {
                            })
                    }
                })
            })
    }
    componentDidMount() {
        //console.log('Form.componentDidMount...')
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    ctx.session = json
                    ToolsUI.showAlert(ctx.session.alerts)
                    //console.log('PageForm SESSION: ', json)
                    this.getData(this.state.action, this.state.app, this.state.table, this.state.view, this.state.form, this.state.id,
                        (result) => {
                        })
                })
            })
    }

    checkFormulaire() {
        this.state.is_form_valide = true;
        if (this.state.action == 'view' || this.state.action == 'delete')
            this.state.is_read_only = true

        if (this.state.formulaire.compute) {
            this.state.formulaire.compute(ctx)
        }
        Object.keys(ctx.elements).forEach(key => {
            ctx.elements[key].b_valide = true
            // read only
            if (this.state.is_read_only)
                ctx.elements[key].is_read_only = true

            // valeur par défaut
            if (ctx.elements[key].value == '') {
                if (ctx.elements[key].default) {
                    if (typeof ctx.elements[key].default === 'function')
                        ctx.elements[key].value = ctx.elements[key].default()
                    else
                        ctx.elements[key].value = ctx.elements[key].default
                }
            }
            if (!ctx.elements[key].value) {
                ctx.elements[key].value = ''
            }

            // ctrl accès - ko le champ sera caché
            if (ctx.elements[key].group) {
                if (ctx.session.user_pseudo && ctx.session.user_pseudo.length > 3) {
                    if (ctx.session.user_profil != ctx.elements[key].group)
                        ctx.elements[key].is_hidden = true
                } else {
                    ctx.elements[key].is_hidden = true
                }
            }

            // Field valide ?
            if (ctx.elements[key].value && !ctx.elements[key].is_read_only && !ctx.elements[key].is_hidden) {
                //console.log(key, ctx.elements[key])
                if (ctx.elements[key].is_valide && !ctx.elements[key].is_valide(ctx.elements[key].value, ctx)) {
                    //console.log('checkFormulaire', key, false, ctx.elements[key].value)
                    ctx.elements[key].b_valide = false
                    this.state.is_form_valide = false
                }
            }
            //console.log('checkFormulaire', key, ctx.elements[key])
        })
        //console.log('checkFormulaire', this.state.is_form_valide)
        this.setState({})
    }

    getData(action, app, table, view, form, id, callback) {
        //console.log('Form.getData: ', action, app, table, view, form, id, ctx.elements)
        this.state.action = action
        this.state.app = app
        this.state.table = table
        this.state.view = view
        this.state.form = form
        this.state.id = id
        this.state.key_name = Dico.apps[app].tables[table].key
        this.state.formulaire = Dico.apps[app].tables[table].forms[form]
        ctx.elements = {}
        Object.keys(Dico.apps[app].tables[table].forms[form].elements).forEach(key => {
            ctx.elements[key] = Object.assign({},
                Dico.apps[app].tables[table].elements[key],
                Dico.apps[app].tables[table].forms[form].elements[key])
        })

        Object.keys(ctx.elements).forEach(key => {
            ctx.elements[key].value = ''
            ctx.elements[key].b_valide = false
        })
        if (action == 'view' || action == 'edit' || action == 'delete') {
            fetch('/api/form/' + app + '/' + table + '/' + view + '/' + form + '/' + id,
                { credentials: 'same-origin' })
                .then(response => {
                    response.json().then(json => {
                        if ( json.alerts ) ToolsUI.showAlert(json.alerts)
                        if (response.ok == true) {
                            let row = JSON.parse(json)
                            //console.log("json", json)
                            Object.keys(row).forEach(key => {
                                //console.log('Form.response: ', key, row[key].value)
                                ctx.elements[key].value = row[key] ? row[key] : ''
                            })
                            this.checkFormulaire()
                            return callback({ ok: true })
                        } else {
                            this.state.error = {
                                code: json.code,
                                message: json.message
                            }
                            this.setState({ is_error: true })
                            return callback({ ok: false })
                        }
                    })
                })
        }
        if (action == 'add' || action == 'ident') {
            this.checkFormulaire()
        }
        return callback({ ok: true })
    }

    identData() {
        let data = ''
        Object.keys(ctx.elements).forEach(key => {
            if (!Tools.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(ctx.elements[key].value)
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
                if ( json.alerts ) ToolsUI.showAlert(json.alerts)
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
        Object.keys(ctx.elements).forEach(key => {
            let param = key + '=' + encodeURIComponent(ctx.elements[key].value)
            data += data.length > 0 ? '&' + param : param
        })
        fetch('/api/' + this.state.app + '/' + this.state.table + '/' + this.state.view + '/' + this.state.form + '/' + this.state.id, {
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
                //console.log('json', json)
                if ( json.alerts ) ToolsUI.showAlert(json.alerts)
                if (response.ok == true) {
                    if (json.code < 4000) {
                        if (this.state.formulaire.return_route) {
                            browserHistory.push(this.state.formulaire.return_route)
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
        Object.keys(ctx.elements).forEach(key => {
            if (!Tools.isRubTemporary(key)) {
                let param = key + '=' + encodeURIComponent(ctx.elements[key].value)
                data += data.length > 0 ? '&' + param : param
            }
        })
        fetch('/api/' + this.state.app + '/' + this.state.table + '/' + this.state.view + '/' + this.state.form + '/' + this.state.id, {
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
                if ( json.alerts ) ToolsUI.showAlert(json.alerts)
                if (response.ok == true) {
                    if (json.code < 4000) {
                        if (this.state.formulaire.return_route) {
                            browserHistory.push(this.state.formulaire.return_route)
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

    insertData() {
        let data = ''
        Object.keys(ctx.elements).forEach(key => {
            let param = key + '=' + encodeURIComponent(ctx.elements[key].value)
            data += data.length > 0 ? '&' + param : param
        })
        fetch('/api/' + this.state.app + '/' + this.state.table + '/' + this.state.view + '/' + this.state.form, {
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
                    console.log('insertData json', json)
                    if ( json.alerts ) ToolsUI.showAlert(json.alerts)
                    if (json.code < 4000) {
                        if (this.state.formulaire.return_route) {
                            browserHistory.push(this.state.formulaire.return_route)
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
        Object.keys(ctx.elements).forEach(key => {
            let is_ok = true
            // if (ctx.elements[key].is_hidden)
            //     is_ok = false
            if (is_ok)
                list_fields.push(key)
        })
        //console.log('PageForm session', ctx.session)
        let display_form = (!this.state.is_error || (this.state.is_error && this.state.error.code < 9000))
            && ctx.session.host && ctx.session.host.length > 3
        //console.log('PageForm', display_form)
        return (
            <form>
                {this.state.is_error &&
                    <div className="w3-panel w3-pale-red w3-leftbar w3-border-red">
                        <p>{this.state.error.code} {this.state.error.message}</p>
                    </div>
                }
                {display_form &&
                    list_fields.map(key =>
                        <div className={ctx.elements[key].is_hidden
                            ? 'w3-row-padding w3-margin-top w3-hide' : 'w3-row-padding w3-margin-top'}
                            key={key}>
                            <Label {...this.state} id={key} />
                            <div className="w3-threequarter">
                                <Field {...this.state} id={key}
                                    value={ctx.elements[key].value}
                                    onEditRow={this.onEditRow}
                                    handleSubmit={this.handleSubmit}
                                    />
                                <Error {...this.state} id={key} />
                                <Help {...this.state} id={key} />
                            </div>
                        </div>
                    )
                }
                {display_form &&
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
                }
            </form>
        )
    }
}

class Label extends React.Component {
    render() {
        //console.log('render', this.props)
        let element = ctx.elements[this.props.id]
        if (!element.is_hidden) {
            switch (element.type) {
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
                                {element.label_long}</label>
                            <label htmlFor={this.props.id} className="w3-label w3-quarter w3-left-align w3-hide-medium w3-hide-large" >
                                {element.label_long}</label>
                        </span>
                    )
            }
        } else {
            // element hidden
            return (
                null
            )
        }
    }
}
class Error extends React.Component {
    render() {
        //console.log('render', this.state)
        let element = ctx.elements[this.props.id]
        if (!element.is_hidden) {
            switch (element.type) {
                default:
                    return (
                        <div className="w3-label w3-text-red w3-small" >
                            {!element.b_valide && element.error &&
                                <span>{element.error}</span>}
                        </div>
                    )
            }
        } else {
            // element hidden
            return (
                null
            )
        }
    }
}
class Help extends React.Component {
    render() {
        let element = ctx.elements[this.props.id]
        //console.log('render', this.state)
        if (!element.is_hidden) {
            switch (element.type) {
                default:
                    return (
                        <div className="w3-label w3-small" >
                            {element.help && element.help &&
                                <span>{element.help}</span>}
                        </div>
                    )
            }
        } else {
            // element hidden
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
            value: props.value,
            checked: props.value == '1' ? true : false,
            options: [],
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleCheckGroup = this.handleCheckGroup.bind(this);
        this.handleButton = this.handleButton.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.getOptions = this.getOptions.bind(this);
    }
    handleButton(e) {
        e.preventDefault();
        //console.log('handleButton', element.action_url)
        fetch(ctx.elements[this.props.id].on_click.action,
            { method: ctx.elements[this.props.id].on_click.method, credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    //console.log(json)
                    browserHistory.push('/')
                })
            })
    }
    handleChange(e) {
        //console.log('Field.handleChange: ', this.props.id, e.target.value)
        //e.preventDefault();
        this.setState({ value: e.target.value })
        this.props.onEditRow(this.props.id, e.target.value)
    }
    handleSelectChange(option) {
        //console.log('Field.handleChange: ', this.props.id, option)
        //e.preventDefault();
        this.setState({ value: option.value })
        this.props.onEditRow(this.props.id, option.value)
    }
    handleCheck(e) {
        //console.log('Field.handleChange: ', this.props.id, e.target.value)
        this.setState({ checked: e.target.checked })
        this.props.onEditRow(this.props.id, e.target.checked ? '1' : '0')
        //console.log('handleChange', this.state)
    }
    handleCheckGroup(obj) {
        console.log('Field.handleChangeGroup: ', this.props.id, obj.join(','), obj)
        this.setState({ value: obj.join(',') })
        if (!ctx.elements[this.props.id].is_multiple) {
            if (obj.length > 1) {
                obj.shift()
            }
        }
        this.props.onEditRow(this.props.id, obj.join(','))
        //console.log('handleChange', this.state)
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Field.componentWillReceiveProps', nextProps.value)
        this.state.value = nextProps.value
        this.state.checked = nextProps.value == '1' ? true : false

    }
    componentDidMount() {
        //console.log('Field.componentDidMount...', this.state, this.props)
        if (ctx.elements[this.props.id].type == 'jointure_select') {
            fetch('/api/select/' + this.props.app + '/' + this.props.table + '/' + this.props.id + '/0', { credentials: 'same-origin' })
                .then(response => {
                    response.json().then(json => {
                        //console.log(json)
                        this.setState({ options: json })
                    })
                })
        }
    }
    getOptions(input) {
        return fetch('/api/select/' + this.props.app + '/' + this.props.table + '/' + this.props.id + '/' + input, { credentials: 'same-origin' })
            .then((response) => {
                console.log('select', response)
                return response.json();
            }).then((json) => {
                return { options: json };
            });
    }
    render() {
        //console.log('render', this.state)
        let element = ctx.elements[this.props.id]
        if (!element.is_hidden) {
            switch (element.type) {
                case 'button':
                    return (
                        <button to={element.action_url} className="w3-btn w3-teal"
                            title={element.title}
                            onClick={this.handleButton}
                            >
                            {element.label_long}
                        </button>
                    )
                case 'check':
                    return (
                        <span className="">
                            <input className="w3-check" type="checkbox"
                                onChange={this.handleCheck}
                                defaultValue={element.value == '1' ? true : false}
                                value={element.value == '1' ? true : false}
                                checked={element.value == '1' ? true : false}
                                name={this.props.id} id={this.props.id}
                                />
                            <label htmlFor={this.props.id} className="w3-validate">
                                &nbsp;{element.label_long}
                            </label>
                        </span>
                    )
                case 'checkgroup':
                    return (
                        <span className="">
                            <CheckboxGroup className=""
                                onChange={this.handleCheckGroup}
                                value={element.value && element.value.length > 0
                                    ? element.value.split(',')
                                    : []
                                }
                                name={this.props.id} id={this.props.id}
                                >
                                {
                                    Object.keys(element.list).map(item =>
                                        <span key={item}>
                                            <Checkbox className="w3-check" value={item} />
                                            <label htmlFor={this.props.id} className="w3-validate">
                                                &nbsp;{element.list[item]}&nbsp;
                                            </label>
                                        </span>
                                    )
                                }
                            </CheckboxGroup>
                        </span>
                    )
                case 'email':
                    return (
                        <input className="w3-input w3-border" type="email"
                            maxLength={element.maxlength}
                            pattern={element.pattern}
                            placeholder={element.placeholder}
                            onChange={this.handleChange}
                            disabled={element.is_read_only}
                            value={element.value}
                            id={this.props.id}
                            />
                    )
                case 'jointure_select':
                    // https://github.com/JedWatson/react-select
                    return (
                        <Select
                            name={this.props.id}
                            value={element.value}
                            //loadOptions={this.getOptions}
                            options={this.state.options}
                            onChange={this.handleSelectChange}
                            />
                    )
                case 'link':
                    let uri = Tools.replaceParams(element.action_url,
                        ctx.elements)
                    return (
                        <Link to={uri} className="w3-text-teal"
                            title={element.title}
                            >
                            {element.label_long}
                        </Link>
                    )
                case 'password':
                    return (
                        <input className="w3-input w3-border" type="password"
                            maxLength={element.maxlength}
                            pattern={element.pattern}
                            placeholder={element.placeholder}
                            onChange={this.handleChange}
                            disabled={element.is_read_only}
                            value={element.value}
                            id={this.props.id}
                            onKeyPress={(e) => { (e.key == 'Enter' ? this.props.handleSubmit() : null) } }
                            />
                    )
                case 'radio':
                    return (
                        <div onChange={this.handleChange} className="w3-padding w3-border" id={this.props.id}>
                            {Object.keys(element.list).map(key =>
                                <span key={key} className="w3-margin-right">
                                    <input className="w3-radio" type="radio"
                                        checked={element.value == key}
                                        disabled={element.is_read_only}
                                        name={this.props.id} value={key} id={key}
                                        onChange={this.handleChange}
                                        />
                                    <label htmlFor={key} className="w3-validate">
                                        &nbsp;{element.list[key]}
                                    </label>
                                </span>
                            )}
                        </div>
                    )
                case 'select':
                    return (
                        <select className="w3-select w3-border"
                            placeholder={element.placeholder}
                            onChange={this.handleChange}
                            disabled={element.is_read_only}
                            value={element.value}
                            id={this.props.id}
                            >
                            {Object.keys(element.list).map(key =>
                                <option key={key} value={key}>
                                    {element.list[key]}
                                </option>
                            )}
                        </select>
                    )
                case 'mail':
                    return (
                        <input className="w3-input w3-border" type="text"
                            maxLength={element.maxlength}
                            pattern={element.pattern}
                            placeholder={element.placeholder}
                            onChange={this.handleChange}
                            disabled={element.is_read_only}
                            value={element.value}
                            id={this.props.id}
                            />
                    )
                case 'textarea':
                    return (
                        <textarea className="w3-input w3-border"
                            maxLength={element.maxlength}
                            pattern={element.pattern}
                            placeholder={element.placeholder}
                            onChange={this.handleChange}
                            disabled={element.is_read_only || element.is_protect}
                            value={element.value}
                            id={this.props.id}
                            />
                    )
                case 'note':
                    return (
                        <div className="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow">
                            <p>{element.note}</p>
                        </div>
                    )
                case 'text':
                    if ((element.is_read_only || element.is_protect) && element.display) {
                        return (<span dangerouslySetInnerHTML={{ __html: element.display(element.value, ctx) }}></span>)
                    } else {
                        return (
                            <input className="w3-input w3-border" type="text"
                                maxLength={element.maxlength}
                                pattern={element.pattern}
                                placeholder={element.placeholder}
                                onChange={this.handleChange}
                                disabled={element.is_read_only || element.is_protect}
                                value={element.value}
                                id={this.props.id}
                                onKeyPress={(e) => { (e.key == 'Enter' ? this.props.handleSubmit() : null) } }
                                />
                        )
                    }
                default:
                    return <div>{this.props.id}.type {element.type} not found</div>
            }
        } else {
            // element hidden
            return (
                <input type="text" name={this.props.id} value={element.value} style={{ display: 'none' }} />
            )
        }
    }

}