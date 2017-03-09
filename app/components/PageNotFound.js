'use strict';

import React from 'react';
import { Link } from 'react-router';
const { Button, Card, CardText, Content, Footer, Header, IconButton
  , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window } = require('./w3.jsx')

import { ctx, Dico } from '../config/Dico'
import { Tools } from '../config/Tools'

import ContainerSidebar from './ContainerSidebar';
import ContainerContent from './ContainerContent';

export default class PageNotFound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      w3_sidebar_open: false
    }
    this.handlePage = this.handlePage.bind(this);
  }
  handlePage(obj) {
    this.setState(obj)
  }

  render() {
    return (
      <div>
        <ContainerSidebar page={this} {...this.state} {...this.props} />
        <ContainerContent>
          <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
            <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
              onClick={(e) => this.handlePage({ w3_sidebar_open: true })}
            ></i>
            <span id="myIntro">Page not found</span>
          </div>
          <Card style={{ width: '100%', margin: 'auto' }}>
            <h1>404</h1>
            <h2>Page not found!</h2>
            <p>
              <Link to="/">Go back to the main page</Link>
            </p>
          </Card>
          <Footer apex={this}>
            <p>{Dico.application.copyright}</p>
          </Footer>
        </ContainerContent>
      </div>
    );
  }
}
