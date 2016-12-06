'use strict';

import React from 'react';
import { Link } from 'react-router';
import Dico from '../config/Dico.js';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

export default class ContainerSidebar extends React.Component {
   constructor(props, context) {
        super(props, context);
        this.state = {
        }
    }

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
        let w3_sidebar_open = this.props.ctx.state.w3_sidebar_open
        return (
            <div>
                <nav className="w3-sidenav w3-collapse w3-white w3-animate-left w3-card-2"
                    onClick={(e) => w3_sidebar_open ? this.props.ctx.handlerCtx({ w3_sidebar_open: false }) : {}}
                    style={{ zIndex: 3, width: '250px', display: w3_sidebar_open ? 'block' : 'none' }} id="mySidenav">
                    <Link to="/" className="w3-border-bottom w3-large w3-theme-dark">{Dico.application.title}</Link>
                    {
                        Object.keys(Dico.tables).map(table =>
                            <NavView table={table} key={table} ctx={this.props.ctx} />
                        )
                    }
                    <Link to={'/help'} activeClassName="w3-theme-l1">Aide</Link>
                    <Link to={'/about'} activeClassName="w3-theme-l1">Info</Link>
                </nav >
                {/* Permet de fermer le sidebar en clicquant dans le Content si small screen*/}
                <div className="w3-overlay w3-hide-large w3-animate-opacity"
                    onClick={(e) => this.props.ctx.handlerCtx({ w3_sidebar_open: false })}
                    style={{ cursor: 'pointer', display: w3_sidebar_open ? 'block' : 'none' }}
                    id="myOverlay"></div>
            </div>
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
                        <Link to={'/view/' + this.props.table + '/' + view} 
                            key={this.props.table + '_' + view}
                            activeClassName="w3-theme-l1"
                            >
                            {Dico.tables[this.props.table].views[view].title}
                        </Link>
                    )
                }
            </div>
        )
    }
}
// Object.keys(Dico.tables[this.props.table].views).map(view =>
//     <Nav onClick={this.handleClickView} ctx={this.props.ctx} key={this.props.table + '_' + view}
//         table={this.props.table} view={view}>
//         {Dico.tables[this.props.table].views[view].title}
//     </Nav>
// )

ContainerSidebar.contextTypes = {
  w3_sidebar_open: React.PropTypes.bool
};
