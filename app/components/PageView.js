'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import { renderToString } from 'react-dom/server'
import 'whatwg-fetch'
import { Link } from 'react-router'
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'

export default class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            app: this.props.params.app,
            table: this.props.params.table,
            view: this.props.params.view,
            rows: [],
            rows_selected: [],
            is_error: false,
            error: {
                code: '',
                message: ''
            }
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }
    selectionChanged(data) {
        this.props.ctx.handleState({ rows_selected: data, key_value: data[0] })
    }
    add(form) {
        this.props.ctx.handleState({ form: form, rows_selected: [], key_value: [], action_form: 'INSERT' })
        this.props.ctx.handleOpenForm('INSERT')
    }
    handleRowUpdated(e) {
        //merge updated row with current row and rerender by setting state
        //console.log(e)
        var rows = this.props.ctx.state.rows;
        Object.assign(rows[e.rowIdx], e.updated);
        this.setState({ rows: rows });
    }
    getData(app, table, view) {
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]) {

            let key_id = Dico.apps[app].tables[table].key

            fetch('/api/view/' + app + '/' + table + '/' + view, { credentials: 'same-origin' })
                .then(response => {
                    //console.log('response', response)
                    response.json().then(json => {
                        //console.log('json', json)
                        if (response.ok == true) {
                            let row_key = Dico.apps[app].tables[table].key
                            ctx.elements = {}
                            Object.keys(Dico.apps[app].tables[table].views[view].cols).forEach(key => {
                                ctx.elements[key] = Object.assign({},
                                    Dico.apps[app].tables[table].rubs[key],
                                    Dico.apps[app].tables[table].views[view].cols[key])
                            })

                            //console.log(JSON.stringify(rows))
                            var tableur = []
                            JSON.parse(json).forEach((row) => {
                                // insertion des colonnes des rubriques temporaires
                                let ligne = {}
                                let key_value = ''
                                Object.keys(ctx.elements).forEach(key => {
                                    if (key == key_id) {
                                        key_value = row[key]
                                        //console.log("key_value", key_value)
                                    }
                                    if (Tools.isRubTemporary(key)) {
                                        //console.log("key", key_value)
                                        ligne[key] = key_value
                                    } else {
                                        ligne[key] = row[key]
                                    }
                                })
                                tableur.push(ligne)
                            })
                            //console.log(JSON.stringify(tableur))
                            this.setState({
                                rows_selected: [],
                                rows: tableur,
                                is_error: false,
                                app: app,
                                table: table,
                                view: view,
                            })
                        } else {
                            this.state.error = {
                                code: json.code,
                                message: json.message
                            }
                            this.setState({
                                is_error: true,
                                app: app,
                                table: table,
                                view: view,
                            })
                        }
                    })
                })
        }
    }
    componentWillReceiveProps(nextProps) {
        //console.log('componentWillReceiveProps', nextProps.params)
        if (nextProps.params) {
            this.getData(nextProps.params.app, nextProps.params.table, nextProps.params.view)
        } else {
            this.getData(nextProps.app, nextProps.table, nextProps.view)
        }
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    //console.log('response', response, json)
                    ctx.session = json
                    this.getData(this.state.app, this.state.table, this.state.view)
                })
            })
    }

    render() {
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]) {

            let app = this.state.app
            let table = this.state.table
            let view = this.state.view
            let form_add = Dico.apps[app].tables[table].views[view].form_add
            let form_view = Dico.apps[app].tables[table].views[view].form_view
            let form_edit = Dico.apps[app].tables[table].views[view].form_edit
            let form_delete = Dico.apps[app].tables[table].views[view].form_delete
            let row_key = Dico.apps[app].tables[table].key
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

                        {(!this.state.is_error && form_add) &&
                            <Link to={'/form/add/' + app + '/' + table + '/' + view + '/' + form_add + '/0'}>
                                <span className="w3-btn-floating-large w3-theme-action"
                                    title={'Ajout ' + Dico.apps[app].tables[table].forms[form_add].title + '...'}
                                    style={{ zIndex: 1000, position: 'fixed', top: '20px', right: '24px' }}>+</span>
                            </Link>
                        }
                        {!this.state.is_error &&
                            <Card>
                                <Table apex={this}
                                    app={app} table={table} view={view}
                                    form_view={form_view} form_edit={form_edit} form_delete={form_delete}
                                    row_key={row_key} rows={this.state.rows}
                                    />
                            </Card>
                        }
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
class Table extends React.Component {
    render() {
        let app = this.props.app
        let table = this.props.table
        let view = this.props.view
        let form_view = this.props.form_view
        let form_edit = this.props.form_edit
        let form_delete = this.props.form_delete
        let row_key = this.props.row_key
        let irow = 0
        //console.log('Table: ', this.props.rows)
        return (
            <table className="w3-table-all w3-hoverable w3-medium w3-card-3">
                <thead>
                    <tr className="w3-theme">
                        {form_view &&
                            <th>&nbsp;</th>
                        }
                        {form_edit &&
                            <th>&nbsp;</th>
                        }
                        {
                            Object.keys(ctx.elements).map(key =>
                                <TH key={key} id={key} />
                            )
                        }
                        {form_delete &&
                            <th>&nbsp;</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.rows.map(row =>
                            <Row key={irow++} row_key={row_key}
                                app={app} table={table} view={view}
                                form_view={form_view} form_edit={form_edit} form_delete={form_delete}
                                row={row} />
                        )
                    }
                </tbody>
            </table>
        )
    }
}

class TH extends React.Component {
    render() {
        if (ctx.elements[this.props.id].is_hidden) {
            return null
        } else {
            return (
                <th>{ctx.elements[this.props.id].label_short}</th>
            )
        }
    }
}

class Row extends React.Component {
    render() {
        let app = this.props.app
        let table = this.props.table
        let view = this.props.view
        let form_view = this.props.form_view
        let form_edit = this.props.form_edit
        let form_delete = this.props.form_delete
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        //console.log('Row: ',table + '->' + view, row_key + '=' + row[row_key], row)
        let icol = 0
        return (
            <tr>
                {form_view &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/view/' + app + '/' + table + '/' + view + '/' + form_view + '/' + key_val}
                            title={'Voir ' + Dico.apps[app].tables[table].forms[form_view].title + '...'}>
                            <i className="material-icons w3-text-blue-grey">visibility</i>
                        </Link>
                    </td>
                }
                {form_edit &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/edit/' + app + '/' + table + '/' + view + '/' + form_edit + '/' + key_val}
                            title={'Modifier ' + Dico.apps[app].tables[table].forms[form_edit].title + '...'}
                            ><i className="material-icons w3-text-teal">edit</i>
                        </Link>
                    </td>
                }
                {
                    Object.keys(row).map(key =>
                        <TD key={icol++} row_key={row_key} id={key}
                            table={table} view={view}
                            row={row} />
                    )
                }
                {form_delete &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/delete/' + app + '/' + table + '/' + view + '/' + form_delete + '/' + key_val}
                            title={'Supprimer ' + Dico.apps[app].tables[table].forms[form_delete].title + '...'}
                            ><i className="material-icons w3-text-orange">delete</i>
                        </Link>
                    </td>
                }
            </tr>
        )
    }
}

class TD extends React.Component {
    render() {
        if (ctx.elements[this.props.id].is_hidden) {
            return null
        } else {
            return (
                <td>
                    <Cell row_key={this.props.row_key} id={this.props.id}
                        table={this.props.table} view={this.props.view}
                        row={this.props.row}
                        />
                </td>
            )
        }
    }
}

class Cell extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        let id = this.props.id
        let val = row[id]
        let element = ctx.elements[id]
        let table = element.table ? element.table : this.props.table
        let view = element.view ? element.view : this.props.view
        let form = element.form ? element.form : this.props.form_edit
        //console.log('Cell:', table, view, id+'='+ val)
        switch (element.type) {
            case 'check':
                return (
                    <input className="w3-check" type="checkbox" disabled
                        checked={val == '1' ? true : false}
                        />
                )
            case 'radio':
                return (
                    <span>{element.list[val]}</span>
                )
            case 'text':
                //let element = React.createElement('<span>A</span>', {})
                if (element.display) {
                    return (<span dangerouslySetInnerHTML={{ __html: element.display(val) }}></span>)
                } else {
                    return <span>{val}</span>
                }
            default:
                return (
                    <span>{val}</span>
                )
        }
    }
}
