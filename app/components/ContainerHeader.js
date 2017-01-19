'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

var PageLayout = {
    HOME: 'HOME',
    VIEW: 'VIEW',
    FORM: 'FORM',
    HELP: 'HELP'
};

export default class HeaderContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let table = this.props.table
        let view = this.props.view
        let form = this.props.form
        switch (this.props.layout) {
            case PageLayout.HOME:
                return (
                    <Header title={this.props.title} {...this.props}>
                    </Header>
                )
            case PageLayout.HELP:
                return (
                    <Header title={this.props.title} apex={this.props.ctx}>
                    </Header>
                )
            case PageLayout.VIEW:
                if (this.props.rows_selected.length == 1) {
                    return (
                        <Header title={this.props.title} apex={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="plus-circled"
                                    onClick={(event) => {
                                        this.props.form = Dico.tables[table].views[view].form_update
                                        this.props.handleOpenForm('UPDATE')
                                    }
                                    } />
                                <Button color="default" icon="trash"
                                    onClick={(event) => {
                                        this.props.handleUpdateForm('DELETE')
                                    }
                                    } />
                            </Toolbar>
                        </Header>
                    )
                } else if (this.props.rows_selected.length > 1) {
                    return (
                        <Header title={this.props.title} apex={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="trash"
                                    onClick={(event) => this.props.ctx.handleUpdateForm('DELETE')} />
                            </Toolbar>
                        </Header>
                    )
                } else {
                    return (
                        <Header title={this.props.title} apex={this.props.ctx}>
                        </Header>
                    )
                }

            case PageLayout.FORM:
                return (
                    <Header title={this.props.title}>
                    </Header>
                )

            default:
                return null

        }
    }
}
