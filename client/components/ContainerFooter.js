'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import Dico from '../../config/Dico.js';

export default class FooterContainer extends React.Component {
    github(event) {
        window.open(Dico.application.url
            , 'github'
            , 'toolbar=0,status=0,width=1024,height=800');
    }
    render() {
        return (
            <Footer ctx={this}>
                <p>{Dico.application.copyright}</p>
            </Footer>
        )
    }
}

