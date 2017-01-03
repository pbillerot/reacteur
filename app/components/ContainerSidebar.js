'use strict';

import React from 'react';
import { Link, browserHistory, Route } from 'react-router';
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
                    <hr />
                    <Link to={'/help'} activeClassName="w3-theme-l1">Aide</Link>
                    <Link to={'/about'} activeClassName="w3-theme-l1">Info</Link>
                    <hr />
                    <IdentContainer />
                </nav >
                {/* Permet de fermer le sidebar en cliquant dans le Content si small screen*/}
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
        let views = []
        Object.keys(Dico.tables[this.props.table].views).forEach(view => {
            let is_ok = true
            if (Dico.tables[this.props.table].views[view].is_hidden
                && Dico.tables[this.props.table].views[view].is_hidden == true)
                is_ok = false
            if (is_ok)
                views.push(view)
        })
        return (
            <div>
                {
                    views.map(view =>
                        <Link to={Dico.tables[this.props.table].views[view].form_auto
                            ? '/form/' + Dico.tables[this.props.table].views[view].form_auto_action
                            + '/' + this.props.table + '/' + view + '/'
                            + Dico.tables[this.props.table].views[view].form_auto + '/0'
                            : '/view/' + this.props.table + '/' + view
                        }
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

ContainerSidebar.contextTypes = {
    w3_sidebar_open: React.PropTypes.bool
};

class IdentContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_dropdown_open: false,
            is_connected: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleClickDisconnect = this.handleClickDisconnect.bind(this);
    }
    handleClick(event) {
        event.preventDefault()
        if (this.state.is_dropdown_open) {
            this.setState({ is_dropdown_open: false })
        } else {
            this.setState({ is_dropdown_open: true })
        }
    }

    handleClickDisconnect(event) {
        event.preventDefault()
        sessionStorage.removeItem('user_id')
        this.setState({ is_dropdown_open: false })
        fetch('/api/cnx/close', { method: "PUT", credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    console.log(json)
                    browserHistory.push('/')
                })
            })
    }

    componentDidMount() {
        //console.log('IdentContainer.componentDidMount')
    }
    componentWillReceiveProps(nextProps) {
        //console.log('IdentContainer.componentWillReceiveProps')
        fetch('/api/session/', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    console.log('session', json)
                    if (json.user_id) {
                        sessionStorage.setItem('user_id', json.user_id)
                        sessionStorage.setItem('user_email', json.user_email)
                        sessionStorage.setItem('user_profil', json.user_profil)
                        this.setState({ is_connected: true })
                    } else {
                        sessionStorage.removeItem('user_id')
                        sessionStorage.removeItem('user_email')
                        sessionStorage.removeItem('user_profil')
                        this.setState({ is_connected: false })
                    }
                })
            })
    }
    render() {
        return (
            <div className="">
                {this.state.is_connected &&
                    <div className="w3-accordion">
                        <a onClick={this.handleClick} className="w3-text-dark-grey">
                            {sessionStorage.getItem('user_id')} connecté <i className={this.state.is_dropdown_open ? 'fa fa-caret-up' : 'fa fa-caret-down'}></i></a>
                        <div className={this.state.is_dropdown_open ? "w3-accordion-content w3-container w3-show" : 'w3-accordion-content w3-container'}>
                            <a onClick={this.handleClickDisconnect}>Se déconnecter</a>
                            {sessionStorage.getItem('user_profil') == 'ADMIN' &&
                                <Link to={'/view/actusers/vall'} activeClassName="w3-text-dark-grey">
                                {Dico.tables['actusers'].views['vall'].title}
                                </Link>
                            }
                        </div>
                    </div>
                }
                {!this.state.is_connected &&
                    <Link to={'/form/ident/actusers/vident/fident/0'} activeClassName="w3-text-dark-grey">Se connecter...</Link>
                }
            </div>
        )
    }
}

