'use strict';

import React from 'react';
import { Link } from 'react-router';
const {Button, Card, CardText, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import Dico from '../../config/Dico.js';
import ContainerContent from './ContainerContent';

export default class PageNotFound extends React.Component {
  render() {
    return (
      <ContainerContent>
        <Header title="Page not found" />

        <Card style={{ width: '100%', margin: 'auto' }}>
            <h1>404</h1>
            <h2>Page not found!</h2>
            <p>
              <Link to="/">Go back to the main page</Link>
            </p>
        </Card>
        <Footer ctx={this}>
          <p>{Dico.application.copyright}</p>
        </Footer>
      </ContainerContent>

    );
  }
}
