'use strict';

import React from 'react';
import { Link } from 'react-router';

import ContainerSidebar from './ContainerSidebar';

// W3
//const {Button, Card, Content, Footer, Header, IconButton
//    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')
import Dico from '../../config/Dico.js';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: Dico.application.desc, // Titre de la fenêtre
            // DICTIONNAIRE
            table: null,
            view: null,
            form: null,
            // Formulaire
            key_id: null,
            key_value: null,
            action_form: 'UPDATE', // INSERT UPDATE DELETE
            form_valid: false,
            // Tableur
            rows: [],
            rows_selected: [],
        }
        this.handleState = this.handleState.bind(this);
        //this.handleOpenView = this.handleOpenView.bind(this);
    }

    /**
    * Juste pour déclencher une actualisation de données du contexte
    */
    handleState(state) {
        //console.log(JSON.stringify(state, null, 4))
        this.setState(state)
    }

    render() {
        return (
            <div>
                <ContainerSidebar ctx={this} />
                {this.props.children}
            </div>
        )
    }
}

