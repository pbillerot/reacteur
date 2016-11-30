'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
//const {Button, Card, Content, Footer, Header, IconButton
//    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

export default class ContainerBody extends React.Component {
    render() {
        console.log('ContainerBody')
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}
