'use strict';

import React from 'react';
import { Link } from 'react-router';
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerContent from './ContainerContent';

import Dico from '../../config/Dico.js';

export default class PagePortail extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ContainerContent {...this.props}>
                <Header title={Dico.application.desc}/>

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
        )
    }
}