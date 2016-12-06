'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import Dico from '../config/Dico.js';

export default class PagePortail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }

    render() {
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this}>
                    <Header title={Dico.application.desc} ctx={this} />

                    <Card>
                        <div className="w3-container w3-section w3-padding-32 w3-card-4 w3-light-grey w3-large">
                            Le framework pour développer des applications en décrivant
                    les rubriques, les formulaires, les vues dans un dictionnaire
                    </div>
                    </Card>
                    <Footer ctx={this}>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
            </div>
        )
    }
}