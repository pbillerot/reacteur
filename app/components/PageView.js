'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
import Pager from './Pager'
// W3
const {Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

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
            filter: '',
            page_total: 0,
            page_current: 0,
            rows: [],
            rows_selected: [],
            is_error: false,
            error: {
                code: '',
                message: ''
            }
        }
        ctx.elements = {}
        this.handleSkipPage = this.handleSkipPage.bind(this);
    }
    handleSkipPage(page) {
        //console.log("handleSkipPage", page)
        this.state.page_current = page
        this.getData(this.state.app, this.state.table, this.state.view)
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

            // recup du filtre dans la session du navigateur
            let filter = sessionStorage.getItem(app + '_' + table + '_' + view);
            if (!filter) filter = ''
            let data = 'filter=' + encodeURIComponent(filter)
            data += '&page_current=' + encodeURIComponent(this.state.page_current)

            fetch('/api/view/' + app + '/' + table + '/' + view, {
                method: "PUT",
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                body: data
            })
                .then(response => {
                    //console.log('response', response)
                    response.json().then(json => {
                        //console.log('json', json)
                        //if ( json.alerts ) ToolsUI.showAlert(json.alerts)
                        if (response.ok == true) {
                            let row_key = Dico.apps[app].tables[table].key
                            ctx.elements = {}
                            Object.keys(Dico.apps[app].tables[table].views[view].elements).forEach(key => {
                                ctx.elements[key] = Object.assign({},
                                    Dico.apps[app].tables[table].elements[key],
                                    Dico.apps[app].tables[table].views[view].elements[key])
                            })

                            //console.log(JSON.stringify(rows))
                            var tableur = []
                            json.rows.forEach((row) => {
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
                                page_total: json.page_total
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
        console.log('componentDidMount...')
        fetch('/api/session', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    //console.log('PageApp SESSION: ', json)
                    ctx.session = json
                    ToolsUI.showAlert(ctx.session.alerts)
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
        let icol = 0
        Object.keys(ctx.elements).forEach(key => {
            if (!ctx.elements[key].is_hidden) {
                icol++
            }
        })
        if (form_view) icol++
        if (form_edit) icol++
        if (form_delete) icol++

        //console.log('Table: ', this.props.rows)
        return (
            <table className="w3-table-all w3-hoverable w3-medium w3-card-3">
                <thead>
                    {Dico.apps[app].tables[table].views[view].with_filter &&
                        <tr className="w3-theme-l4">
                            <td colSpan={icol}><div className="w3-row">
                                <div className="w3-col s4">
                                    <Search apex={this.props.apex} />
                                </div>
                                <div className="w3-col s8 w3-bar">
                                    <Pager key={view} className="w3-right"
                                        total={this.props.apex.state.page_total}
                                        current={this.props.apex.state.page_current}
                                        onSkipTo={this.props.apex.handleSkipPage}
                                    />
                                    <span className="w3-padding-8 w3-margin-right w3-right">Page: </span>
                                </div>
                            </div>
                            </td>
                        </tr>
                    }
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

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: ''
        }
        this.filterChanged = this.filterChanged.bind(this);
        this.filterSubmit = this.filterSubmit.bind(this);
    }
    componentDidMount() {
        //console.log('Search.componentDidMount')
    }
    componentWillReceiveProps(nextProps) {
        //console.log('Search.componentDidMount')
    }
    filterChanged(e) {
        this.setState({ filter: e.target.value })
        this.props.apex.state.filter = e.target.value
    }
    filterSubmit() {
        sessionStorage.setItem(this.props.apex.state.app + '_' + this.props.apex.state.table + '_' + this.props.apex.state.view, this.state.filter)
        this.props.apex.getData(this.props.apex.state.app, this.props.apex.state.table, this.props.apex.state.view)
    }

    render() {
        //console.log("Search", this.props)
        return (
            <div className="w3-row">
                <span className="w3-col s9">
                    <input className="w3-input w3-border w3-small" name="filter" type="text" placeholder="recherche"
                        onChange={this.filterChanged}
                        value={this.props.apex.state.filter}
                        id="filter"
                        onKeyPress={(e) => { (e.key == 'Enter' ? this.filterSubmit() : null) }}
                    />
                </span>
                <span className="w3-col s3 w3-padding-8">
                    <span className="w3-margin-left" style={{ height: '100%' }}
                        onClick={this.filterSubmit} >
                        <i className="w3-large fa fa-search"></i>
                    </span>
                </span>
            </div>
        )
    }
}
