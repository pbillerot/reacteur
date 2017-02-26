'use strict';

import React from 'react';
import { Link, browserHistory, Route } from 'react-router';
import { ctx, Dico } from '../config/Dico';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Window} = require('./w3.jsx')

export default class ContainerSidebar extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            app: this.props.app,
        }
    }

    handleAPropos(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.handleState({ about: true })
    }
    handleAccueil(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.setState({ title: 'Aide', layout: PageLayout.HOME })
    }
    handleHelp(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.setState({ title: 'Aide', layout: PageLayout.HELP })
    }
    componentDidMount() {
        //console.log('ContainerSidebar.componentDidMount')
    }
    componentWillReceiveProps(nextProps) {
        //console.log('ContainerSidebar.componentWillReceiveProps', nextProps)
        if (nextProps.params) {
            this.setState({ app: nextProps.params.app })
        }
    }
    render() {
        let w3_sidebar_open = this.props.w3_sidebar_open
        let title = this.state.app ? Dico.apps[this.state.app].title : Dico.application.title
        //console.log("ContainerSidebar", this.state, title)
        return (
            <div>
                <nav className="w3-sidenav w3-collapse w3-white w3-animate-left w3-card-2"
                    onClick={(e) => w3_sidebar_open ? this.props.handlerCtx({ w3_sidebar_open: false }) : {}}
                    style={{ zIndex: 3, width: '250px', display: w3_sidebar_open ? 'block' : 'none' }} id="mySidenav">
                    <Link to="/" className="w3-border-bottom w3-large w3-theme-dark">{title}</Link>
                    {this.props.location.pathname != '/' &&
                        <Link to={'/'} className=""><i className="fa fa-home"></i> retour au portail</Link>
                    }
                    <IdentContainer />
                    <hr />
                    {this.state.app &&
                        Object.keys(Dico.apps[this.state.app].tables).map(table =>
                            <NavView app={this.state.app} table={table} key={table} apex={this.props} />
                        )
                    }
                    <hr />
                    <Link to={'/app/' + this.state.app} activeClassName="w3-theme-l1">Aide</Link>
                    <Link to={'/about'} activeClassName="w3-theme-l1">Info</Link>
                </nav >
                {/* Permet de fermer le sidebar en cliquant dans le Content si small screen*/}
                <div className="w3-overlay w3-hide-large w3-animate-opacity"
                    onClick={(e) => this.props.handlerCtx({ w3_sidebar_open: false })}
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
        this.props.state.table = table
        this.props.state.view = view
        this.props.state.w3_menu_current = table + '_' + view
        this.props.handleOpenView()
    }
    render() {
        let views = []
        Object.keys(Dico.apps[this.props.app].tables[this.props.table].views).forEach(view => {
            let is_ok = true
            if (Dico.apps[this.props.app].tables[this.props.table].views[view].is_hidden
                && Dico.apps[this.props.app].tables[this.props.table].views[view].is_hidden == true)
                is_ok = false
            if (Dico.apps[this.props.app].tables[this.props.table].views[view].group
                && Dico.apps[this.props.app].tables[this.props.table].views[view].group.length > 0) {
                if (Dico.apps[this.props.app].tables[this.props.table].views[view].group != ctx.session.user_profil) {
                    is_ok = false
                }
            }
            if (is_ok)
                views.push(view)
        })
        //console.log("NavView2", this.props.app, this.props.table, views)
        return (
            <div>
                {
                    views.map(view =>
                        <Link to={Dico.apps[this.props.app].tables[this.props.table].views[view].form_auto
                            ? '/form/' + Dico.apps[this.props.app].tables[this.props.table].views[view].form_auto_action
                            + '/' + this.props.app + '/' + this.props.table + '/' + view + '/'
                            + Dico.apps[this.props.app].tables[this.props.table].views[view].form_auto + '/0'
                            : '/view/' + this.props.app + '/' + this.props.table + '/' + view
                        }
                            key={this.props.table + '_' + view}
                            activeClassName="w3-theme-l1"
                        >
                            {Dico.apps[this.props.app].tables[this.props.table].views[view].title}
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
    }
    componentDidMount() {
        //console.log('IdentContainer.componentDidMount')
        fetch('/api/session/', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    ctx.session = json
                    if (ctx.session.user_pseudo && ctx.session.user_pseudo.length > 0) {
                        this.setState({ is_connected: true })
                    }
                })
            })
    }
    componentWillReceiveProps(nextProps) {
        //console.log('IdentContainer.componentWillReceiveProps')
        // fetch('/api/session/', { credentials: 'same-origin' })
        //     .then(response => {
        //         response.json().then(json => {
        //             //console.log('session', json)
        //             ctx.session = json
        //             if (ctx.session.user_pseudo && ctx.session.user_pseudo.length > 0) {
        //                 this.setState({ is_connected: true })
        //             }
        //         })
        //     })
    }
    render() {
        //console.log("IdentContainer", this.props)
        return (
            <div className="">
                {this.state.is_connected &&
                    <div>
                        <Link className="w3-text-teal" to={'/form/view/reacteur/actusers/vident/fmenuident/' + ctx.session.user_pseudo}>
                            {ctx.session.user_pseudo} <i className="fa fa-caret-right"></i>
                            <br /><span className="w3-small">{ctx.session.user_email}</span>
                        </Link>
                    </div>
                }
                {!this.state.is_connected &&
                    <Link to={'/form/ident/reacteur/actusers/vident/fident/0'} activeClassName="w3-text-dark-grey">Se connecter...</Link>
                }
            </div>
        )
    }
}
