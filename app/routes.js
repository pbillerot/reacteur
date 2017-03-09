'use strict';

import React from 'react'
import { Route, IndexRoute, Router } from 'react-router'
import Layout from './components/Layout';
import PageApp from './components/PageApp';
import PageNotFound from './components/PageNotFound';
import PagePortail from './components/PagePortail';
import PageView from './components/PageView';
import PageForm from './components/PageForm';
//import PageAbout from './components/PageAbout';

const routes = (
    <Route path="/" component={Layout}>
      <IndexRoute component={PagePortail} />
      <Route path="/app/:app" component={PageApp} />
      <Route path="/view/:app/:table/:view" component={PageView} />
      <Route path="/form/:action/:app/:table/:view/:form/:id" component={PageForm} />
      <Route path="*" component={PageNotFound} />
    </Route>
);
export default routes;
