'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

export default class ContainerContent extends React.Component {
    render() {
        return (
            <div className="w3-main w3-padding-64" style={{ marginLeft: '250px' }}>
                {this.props.children}
            </div>
        )
    }
}

