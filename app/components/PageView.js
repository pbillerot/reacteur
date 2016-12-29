'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'
import { Link } from 'react-router'
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import Dico from '../config/Dico.js';

export default class PageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            table: this.props.params.table,
            view: this.props.params.view,
            rows: [],
            rows_selected: []
        }

    }
    handlerCtx(obj) {
        //console.log('handlerCtx: ', obj)
        this.setState(obj)
    }

    setRows(table, view, rows) {
        let form_edit = Dico.tables[table].views[view].form_edit
        let rubs = Dico.tables[table].rubs
        let cols = Dico.tables[table].views[view].rubs
        let row_key = Dico.tables[table].key

        //console.log(JSON.stringify(rows))
        var tableur = []
        rows.forEach((row) => {
            // insertion des colonnes des rubriques temporaires
            let ligne = {}
            let key_value = ''
            Object.keys(cols).forEach(key => {
                if (key == this.state.key_id) {
                    key_value = row[key]
                }
                if (Dico.isRubTemporary(key)) {
                    ligne[key] = key_value
                } else {
                    ligne[key] = row[key]
                }
            })
            tableur.push(ligne)
        })
        //console.log(JSON.stringify(tableur))
        this.setState({
            table: table, view: view,
            rows_selected: [], rows: tableur
        })
    }

    selectionChanged(data) {
        this.props.ctx.handleState({ rows_selected: data, key_value: data[0] })
    }
    add(form) {
        this.props.ctx.handleState({ form: form, rows_selected: [], key_value: [], action_form: 'INSERT' })
        this.props.ctx.handleOpenForm('INSERT')
    }
    columns(rubs, cols) {
        let columns = []
        Object.keys(cols).forEach(key => {
            columns.push({
                name: key,
                title: rubs[key].label_short
            })
        })
        return columns
    }
    handleRowUpdated(e) {
        //merge updated row with current row and rerender by setting state
        //console.log(e)
        var rows = this.props.ctx.state.rows;
        Object.assign(rows[e.rowIdx], e.updated);
        this.setState({ rows: rows });
    }
    getData(table, view) {
        fetch('/api/view/' + table + '/' + view, { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    // traitement du JSON
                    //console.log('response: ', json)
                    //this.state.rows = JSON.parse(json.rows)
                    let rubs = Dico.tables[table].rubs
                    let cols = Dico.tables[table].views[view].rubs
                    let row_key = Dico.tables[table].key

                    //console.log(JSON.stringify(rows))
                    var tableur = []
                    JSON.parse(json).forEach((row) => {
                        // insertion des colonnes des rubriques temporaires
                        let ligne = {}
                        let key_value = ''
                        Object.keys(cols).forEach(key => {
                            if (key == this.state.key_id) {
                                key_value = row[key]
                            }
                            if (Dico.isRubTemporary(key)) {
                                ligne[key] = key_value
                            } else {
                                ligne[key] = row[key]
                            }
                        })
                        tableur.push(ligne)
                    })
                    //console.log(JSON.stringify(tableur))
                    this.setState({
                        table: table, view: view,
                        rows_selected: [], rows: tableur
                    })

                })
            })
    }
    componentWillReceiveProps(nextProps) {
        //console.log('componentWillReceiveProps', nextProps.params)
        this.getData(nextProps.params.table, nextProps.params.view)
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        this.getData(this.state.table, this.state.view)
    }

    render() {
        let table = this.state.table
        let view = this.state.view
        let form_add = Dico.tables[table].views[view].form_add
        let form_view = Dico.tables[table].views[view].form_view
        let form_edit = Dico.tables[table].views[view].form_edit
        let form_delete = Dico.tables[table].views[view].form_delete
        let rubs = Dico.tables[table].rubs
        let cols = Dico.tables[table].views[view].rubs
        let row_key = Dico.tables[table].key
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this}>
                    <Header title={Dico.tables[table].views[view].title} ctx={this} />
                    {form_add &&
                        <Link to={'/form/add/' + table + '/' + view + '/' + form_add + '/0'}>
                            <span className="w3-btn-floating-large w3-theme-action"
                                title={'Ajout ' + Dico.tables[table].forms[form_add].title + '...'}
                                style={{ zIndex: 1000, position: 'fixed', top: '20px', right: '24px' }}>+</span>
                        </Link>
                    }
                    <Card>
                        <Table ctx={this}
                            table={table} view={view}
                            form_view={form_view} form_edit={form_edit} form_delete={form_delete}
                            row_key={row_key} rubs={rubs} cols={cols} rows={this.state.rows}
                            />
                    </Card>

                    <Footer ctx={this}>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
            </div>
        )
    }
}
class Table extends React.Component {
    render() {
        let table = this.props.table
        let view = this.props.view
        let form_view = this.props.form_view
        let form_edit = this.props.form_edit
        let form_delete = this.props.form_delete
        let cols = this.props.cols
        let rubs = this.props.rubs
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
                            Object.keys(cols).map(key =>
                                <th key={key}>{rubs[key].label_short}</th>
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
                                table={table} view={view}
                                form_view={form_view} form_edit={form_edit} form_delete={form_delete}
                                row={row} cols={cols} rubs={rubs} />
                        )
                    }
                </tbody>
            </table>
        )
    }
}

class Row extends React.Component {
    render() {
        let table = this.props.table
        let view = this.props.view
        let form_view = this.props.form_view
        let form_edit = this.props.form_edit
        let form_delete = this.props.form_delete
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        //console.log('Row: ',table + '->' + view, row_key + '=' + row[row_key], row)
        let icol = 0
        return (
            <tr>
                {form_view &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/view/' + table + '/' + view + '/' + form_view + '/' + key_val}
                            title={'Voir ' + Dico.tables[table].forms[form_view].title + '...'}>
                            <i className="material-icons w3-text-blue-grey w3-large">visibility</i>
                        </Link>
                    </td>
                }
                {form_edit &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/edit/' + table + '/' + view + '/' + form_edit + '/' + key_val}
                            title={'Edition de ' + Dico.tables[table].forms[form_edit].title + '...'}
                            ><i className="material-icons w3-text-teal w3-large">edit</i>
                        </Link>
                    </td>
                }
                {
                    Object.keys(row).map(key =>
                        <td key={icol++} >
                            <Cell row_key={row_key} col_id={key}
                                table={table} view={view}
                                row={row} cols={cols} rubs={rubs}
                                />
                        </td>
                    )
                }
                {form_delete &&
                    <td style={{ width: '30px' }}>
                        <Link to={'/form/delete/' + table + '/' + view + '/' + form_delete + '/' + key_val}
                            title={'Suppression de ' + Dico.tables[table].forms[form_delete].title + '...'}
                            ><i className="material-icons w3-text-deep-orange w3-large">delete</i>
                        </Link>
                    </td>
                }
            </tr>
        )
    }
}

class Cell extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        let key = this.props.col_id
        let val = row[key]
        let rub = rubs[key]
        let col = cols[key]
        let table = rub.table ? rub.table : this.props.table
        let view = rub.view ? rub.view : this.props.view
        let form = rub.form ? rub.form : this.props.form_edit
        //console.log('Cell:', table, view, key+'='+ val)
        switch (rub.type) {
            case 'text':
            default:
                return (
                    <span>{val}</span>
                )
        }
    }
}
