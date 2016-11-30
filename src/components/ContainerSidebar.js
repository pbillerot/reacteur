'use strict';

import React from 'react';
import { Link } from 'react-router';
import Dico from '../data/Dico.js';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

export default class SidebarContainer extends React.Component {
    handleAPropos(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.handleState({ about: true })
    }
    handleAccueil(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.setState({ title: 'Aide', layout: PageLayout.HOME })
    }
    handleHelp(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.setState({ title: 'Aide', layout: PageLayout.HELP })
    }
    render() {
        return (
            <Sidebar title={Dico.application.title} ctx={this.props.ctx}>
                {
                    Object.keys(Dico.tables).map(table =>
                        <NavView table={table} key={table} ctx={this.props.ctx} />
                    )
                }
            </Sidebar>
        );
    }
}
class NavView extends React.Component {
    constructor(props) {
        super(props);
        this.handleClickView = this.handleClickView.bind(this);
    }
    handleClickView(table, view, event) {
        event.preventDefault()
        this.props.ctx.state.table = table
        this.props.ctx.state.view = view
        this.props.ctx.state.w3_menu_current = table + '_' + view
        this.props.ctx.handleOpenView()
    }
    render() {
        return (
            <div>
                {
                    Object.keys(Dico.tables[this.props.table].views).map(view =>
                        <Nav onClick={this.handleClickView} ctx={this.props.ctx} key={this.props.table + '_' + view}
                            table={this.props.table} view={view}>
                            {Dico.tables[this.props.table].views[view].title}
                        </Nav>
                    )
                }
            </div>
        )
    }
}
