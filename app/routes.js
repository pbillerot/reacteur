'use strict';

import React from 'react'
import { Route, IndexRoute, Router } from 'react-router'
import Layout from './components/Layout';
import PageNotFound from './components/PageNotFound';
import PagePortail from './components/PagePortail';
import PageView from './components/PageView';
//import PageForm from './PageForm';
import PageHelp from './components/PageHelp';
//import PageAbout from './components/PageAbout';
var ctx = {
  w3_sidebar_open: false
}
const routes = (
  <Router>
    <Route path="/" component={Layout}>
      <IndexRoute component={PagePortail}/>
      <Route path="/help" component={PageHelp}/>
      <Route path="/view/:table/:view" component={PageView}/>
      {/*
          <Route path="/form/:table/:view/:form/:id" component={PageForm}/>
          <Route path="/about" component={PageAbout}/>
    */}
      <Route path="*" component={PageNotFound}/>
    </Route>
  </Router>
);
function createElement(Component, props) {
  // make sure you pass all the props in!
  console.log('createElement', props)
  return <Component ctx={ctx} {...props}/>
}
export default routes;
