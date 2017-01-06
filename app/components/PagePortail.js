'use strict';

import React from 'react';
import 'whatwg-fetch'
import { Link } from 'react-router';
const Markdown = require('react-remarkable')
// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

import {Dico} from '../config/Dico.js';

export default class PagePortail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false,
            markdown: ''
        }
    }
    handlerCtx(obj) {
        this.setState(obj)
    }
    componentDidMount() {
        //console.log('componentDidMount...')
        fetch('/api/portail', {
            credentials: 'same-origin'
        })
            .then(response => {
                var contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    response.json().then(json => {
                        // traitement du JSON
                        //console.log('response: ', json)
                        this.setState(json)
                    })
                } else {
                    response.text().then(text => {
                        // traitement du JSON
                        //console.log('response: ', text)
                        this.setState({ markdown: text })
                    })
                }
            })
    }

    render() {
        return (
            <div>
                <ContainerSidebar ctx={this} />
                <ContainerContent ctx={this}>
                    <Header title={Dico.application.desc} ctx={this} />

                    <Card style={{ width: '100%', margin: 'auto' }}>
                        {<Markdown source={this.state.markdown} />}
                    </Card>

                    <Footer ctx={this}>
                        <p>{Dico.application.copyright}</p>
                    </Footer>
                </ContainerContent>
            </div>
        )
    }
}