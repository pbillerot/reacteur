'use strict';

import React from 'react';
import { Link } from 'react-router';
const {Button, Card, CardText, Content, Footer, Header, IconButton
  , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./w3.jsx')

import Dico from '../config/Dico.js';
import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

export default class PageNotFound extends React.Component {
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
        <ContainerContent>
          <Header title="Page not found" ctx={this} />

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
      </div>
    );
  }
}