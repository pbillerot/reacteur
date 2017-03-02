'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
// W3
const {Alerter, Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import ContainerPager from './ContainerPager'

import { Dico } from '../config/Dico'
import { Tools } from '../config/Tools'
import { ToolsUI } from '../config/ToolsUI'

export default class ContainerView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_data_recepted: false,
            app: this.props.app,
            table: this.props.table,
            view: this.props.view,
            filter: '',
            page_total: 0,
            page_current: 0,
            rows: [],
            rows_selected: [],
            is_error: false,
            error: {
                code: '',
                message: ''
            },
            ctx: {
                elements: {},
                session: this.props.ctx.session,
            }
        }
        this.handleSkipPage = this.handleSkipPage.bind(this);
        this.handleFilterChanged = this.handleFilterChanged.bind(this);
        this.handleFilterSubmit = this.handleFilterSubmit.bind(this);
        //console.log("ContainerView.constructor", this.state)
    }
    handleSkipPage(page) {
        //console.log("ContainerView.handleSkipPage", page)
        this.state.page_current = page
        this.getData(this.state.app, this.state.table, this.state.view)
    }
    handleFilterChanged(e) {
        //console.log("ContainerView.handleFilterChanged", e.target.value)
        this.setState({ filter: e.target.value })
    }
    handleFilterSubmit() {
        //console.log("ContainerView.handleFilterSubmit")
        sessionStorage.setItem(this.state.app + '_' + this.state.table + '_' + this.state.view, this.state.filter);
        this.getData(this.state.app, this.state.table, this.state.view)
    }

    componentWillReceiveProps(nextProps) {
        //console.log('ContainerView.componentWillReceiveProps', nextProps.params)
        this.state.is_data_recepted = false
        if (nextProps.params) {
            this.state.filter =
                sessionStorage.getItem(nextProps.params.app + '_' + nextProps.params.table + '_' + nextProps.params.view)
            if (this.state.filter == null) this.state.filter = ''
            this.getData(nextProps.params.app, nextProps.params.table, nextProps.params.view)
        } else {
            this.state.filter =
                sessionStorage.getItem(nextProps.app + '_' + nextProps.table + '_' + nextProps.view)
            if (this.state.filter == null) this.state.filter = ''
            this.getData(nextProps.app, nextProps.table, nextProps.view)
        }
    }
    componentDidMount() {
        //console.log('ContainerView.componentDidMount...', this.state)
        this.state.filter = sessionStorage.getItem(this.state.app + '_' + this.state.table + '_' + this.state.view)
        if (this.state.filter == null) this.state.filter = ''
        this.getData(this.state.app, this.state.table, this.state.view)
    }

    getData(app, table, view) {
        if (Dico.apps[this.state.app]
            && Dico.apps[this.state.app].tables[this.state.table]
            && Dico.apps[this.state.app].tables[this.state.table].views[this.state.view]) {

            let key_id = Dico.apps[app].tables[table].key

            // recup du filtre dans la session du navigateur
            let filter = sessionStorage.getItem(app + '_' + table + '_' + view);
            if (filter == null) filter = ''
            let data = 'filter=' + encodeURIComponent(filter)
            data += '&page_current=' + encodeURIComponent(this.state.page_current)
            if (this.props.where) {
                data += "&where=" + encodeURIComponent(this.props.where)
            }

            let url = '/api/view/' + app + '/' + table + '/' + view

            fetch(url, {
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
                        this.state.is_data_recepted = true
                        if (response.ok == true) {
                            let row_key = Dico.apps[app].tables[table].key
                            this.state.ctx.elements = {}
                            Object.keys(Dico.apps[app].tables[table].views[view].elements).forEach(key => {
                                this.state.ctx.elements[key] = Object.assign({},
                                    Dico.apps[app].tables[table].elements[key],
                                    Dico.apps[app].tables[table].views[view].elements[key])
                            })

                            //console.log(JSON.stringify(rows))
                            var tableur = []
                            json.rows.forEach((row) => {
                                // insertion des colonnes des rubriques temporaires
                                let ligne = {}
                                let key_value = ''
                                Object.keys(this.state.ctx.elements).forEach(key => {
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

    render() {
        let app = this.state.app
        let table = this.state.table
        let view = this.state.view
        let page_current = this.state.page_current
        let form_add = Dico.apps[app].tables[table].views[view].form_add
        let form_view = Dico.apps[app].tables[table].views[view].form_view
        let form_edit = Dico.apps[app].tables[table].views[view].form_edit
        let form_delete = Dico.apps[app].tables[table].views[view].form_delete
        let row_key = Dico.apps[app].tables[table].key

        let irow = 0
        let icol = 0
        Object.keys(this.state.ctx.elements).forEach(key => {
            if (!this.state.ctx.elements[key].is_hidden) {
                icol++
            }
        })
        if (form_view) icol++
        if (form_edit) icol++
        if (form_delete) icol++
        //console.log("ContainerView.render", this.state.is_data_recepted)
        if (this.state.is_data_recepted) {
            return (
                <div>
                    {(!this.state.is_error && form_add && !this.props.where) &&
                        <Link to={'/form/add/' + app + '/' + table + '/' + view + '/' + form_add + '/0'}>
                            <span className="w3-btn-floating-large w3-theme-action"
                                title={'Ajout ' + Dico.apps[app].tables[table].forms[form_add].title + '...'}
                                style={{ zIndex: 1000, position: 'fixed', top: '20px', right: '24px' }}>+</span>
                        </Link>
                    }
                    <table className="w3-table-all w3-hoverable w3-medium w3-card-3">
                        <thead>
                            {Dico.apps[app].tables[table].views[view].with_filter &&
                                <tr className="w3-theme-l4">
                                    <td colSpan={icol}><div className="w3-row">
                                        <div className="w3-col s3">
                                            <Search {...this.props}
                                                filter={this.state.filter}
                                                handleFilterChanged={this.handleFilterChanged}
                                                handleFilterSubmit={this.handleFilterSubmit}
                                            />
                                        </div>
                                        <div className="w3-col s9 w3-bar">
                                            <ContainerPager {...this.props} key={view} className="w3-right"
                                                total={this.state.page_total}
                                                current={this.state.page_current}
                                                onSkipTo={this.handleSkipPage}
                                            />
                                            <span className="w3-padding-8 w3-right" style={{ marginRight: '8px' }} >Page: </span>
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
                                    Object.keys(this.state.ctx.elements).map(key =>
                                        <TH key={key} id={key} ctx={this.state.ctx} />
                                    )
                                }
                                {form_delete &&
                                    <th>&nbsp;</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.rows.map(row =>
                                    <Row key={irow++} row_key={row_key} ctx={this.state.ctx}
                                        app={app} table={table} view={view}
                                        form_view={form_view} form_edit={form_edit} form_delete={form_delete}
                                        row={row} />
                                )
                            }
                        </tbody>
                    </table>
                </div>
            )
        } else {
            return null
        }
    }
}

class TH extends React.Component {
    render() {
        if (this.props.ctx.elements[this.props.id].is_hidden) {
            return null
        } else {
            return (
                <th>{this.props.ctx.elements[this.props.id].label_short}</th>
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
                        <TD key={icol++} ctx={this.props.ctx} row_key={row_key} id={key}
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
        if (this.props.ctx.elements[this.props.id].is_hidden) {
            return null
        } else {
            return (
                <td>
                    <Cell ctx={this.props.ctx} row_key={this.props.row_key} id={this.props.id}
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
        let element = this.props.ctx.elements[id]
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
        state: {
            filter: ''
        }
    }

    render() {
        //console.log("Search", this.props.filter)
        return (
            <div className="w3-row">
                <span className="w3-col s9">
                    <input className="w3-input w3-border w3-small" name="filter" type="text" placeholder="recherche"
                        onChange={this.props.handleFilterChanged}
                        value={this.props.filter}
                        id="filter"
                        onKeyPress={(e) => { (e.key == 'Enter' ? this.props.handleFilterSubmit() : null) }}
                    />
                </span>
                <span className="w3-col s3 w3-padding-8">
                    <span className="" style={{ marginLeft: '8px', height: '100%' }}
                        onClick={this.props.handleFilterSubmit} >
                        <i className="w3-large fa fa-search"></i>
                    </span>
                </span>
            </div>
        )
    }
}