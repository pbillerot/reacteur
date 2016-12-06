'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
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
        this.handleEditRow = this.handleEditRow.bind(this);
    }
    handlerCtx(obj) {
        //console.log('handlerCtx: ', obj)
        this.setState(obj)
    }

    setRows(rows) {
        let table = this.state.table
        let view = this.state.view
        let form_update = Dico.tables[table].views[view].form_update
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
    handleEditRow(table, view, form, key_value) {
        console.log(table, view, form, key_value)
        this.props.ctx.state.table = table
        this.props.ctx.state.view = view
        this.props.ctx.state.form = form
        this.props.ctx.state.key_value = key_value
        //this.props.ctx.handleOpenForm('UPDATE')
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        fetch('/api/view/' + this.state.table + '/' + this.state.view)
            .then(response => {
                var contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    response.json().then(json => {
                        // traitement du JSON
                        //console.log('response: ', json)
                        //this.state.rows = JSON.parse(json.rows)
                        this.setRows(JSON.parse(json))
                    })
                } else {
                    response.text().then(text => {
                        // traitement du JSON
                        //console.log('response: ', text)
                        this.setState({ markdown: text })
                    })
                }
            })
    }

    render() {
        let table = this.state.table
        let view = this.state.view
        let form_update = Dico.tables[table].views[view].form_update
        let rubs = Dico.tables[table].rubs
        let cols = Dico.tables[table].views[view].rubs
        let row_key = Dico.tables[table].key
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this}>
                    <Header title={Dico.tables[table].views[view].title} ctx={this} />

                    <Card>
                        <Table ctx={this}
                            table={table} view={view} form_update={form_update}
                            row_key={row_key} rubs={rubs} cols={cols} rows={this.state.rows}
                            onEditRow={this.handleEditRow} />
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
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row_key = this.props.row_key
        let irow = 0
        //console.log('Table: ', this.props.rows)
        return (
            <table className="w3-table-all w3-hoverable w3-medium w3-card-3">
                <thead>
                    <tr className="w3-theme">
                        {
                            Object.keys(cols).map(key =>
                                <th key={key}>{rubs[key].label_short}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.rows.map(row =>
                            <Row key={irow++} row_key={row_key}
                                table={table} view={view} form_update={form_update}
                                row={row} cols={cols} rubs={rubs} onEditRow={this.props.onEditRow} />
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
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        //console.log('Row: ',table + '->' + view, row_key + '=' + row[row_key], row)
        let icol = 0
        return (
            <tr>
                {
                    Object.keys(row).map(key =>
                        <Cell key={icol++} row_key={row_key} col_id={key}
                            table={table} view={view} form_update={form_update}
                            row={row} cols={cols} rubs={rubs}
                            onEditRow={this.props.onEditRow}
                            />
                    )
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
        let table = this.props.table
        let view = this.props.view
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        let key = this.props.col_id
        let val = row[key]
        let rub = rubs[key]
        let col = cols[key]
        //console.log('Cell:', table, view, key+'='+ val)
        switch (rub.type) {
            case 'btn':
                return (
                    <td>
                        <button className="w3-btn w3-small w3-teal w3-padding-tiny" value="edit" onClick={(e) => this.props.onEditRow(table, view, form_update, key_val)}
                            ><i className="material-icons w3-small">edit</i>
                        </button>
                    </td>
                )
            case 'text':
            default:
                return (
                    <td>{val}</td>
                )
        }
    }
}
