'use strict';

import React from 'react';
import { Link } from 'react-router';

// W3
//const {Button, Card, Content, Footer, Header, IconButton
//    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')
import Dico from '../config/Dico.js';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false
        }
    }
    
    getChildContext() {
        return {
            w3_sidebar_open: this.state.w3_sidebar_open
        }
    }
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}
Layout.childContextTypes = {
        w3_sidebar_open: React.PropTypes.bool
}

