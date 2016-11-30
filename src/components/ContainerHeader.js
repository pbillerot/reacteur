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

    render() {
        let table = this.props.ctx.state.table
        let view = this.props.ctx.state.view
        let form = this.props.ctx.state.form
        switch (this.props.ctx.state.layout) {
            case PageLayout.HOME:
                return (
                    <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                    </Header>
                )
            case PageLayout.HELP:
                return (
                    <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                    </Header>
                )
            case PageLayout.VIEW:
                if (this.props.ctx.state.rows_selected.length == 1) {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="plus-circled"
                                    onClick={(event) => {
                                        this.props.ctx.state.form = Dico.tables[table].views[view].form_update
                                        this.props.ctx.handleOpenForm('UPDATE')
                                    }
                                    } />
                                <Button color="default" icon="trash"
                                    onClick={(event) => {
                                        this.props.ctx.handleUpdateForm('DELETE')
                                    }
                                    } />
                            </Toolbar>
                        </Header>
                    )
                } else if (this.props.ctx.state.rows_selected.length > 1) {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="trash"
                                    onClick={(event) => this.props.ctx.handleUpdateForm('DELETE')} />
                            </Toolbar>
                        </Header>
                    )
                } else {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                        </Header>
                    )
                }

            case PageLayout.FORM:
                return (
                    <Header title={this.props.ctx.state.title}>
                    </Header>
                )

            default:
                return null

        }
    }
}
