'use strict';

import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App';
import PageIndex from './components/PageIndex';
import PageNotFound from './components/PageNotFound';

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={PageIndex}/>
    <Route path="*" component={PageNotFound}/>
  </Route>
);

export default routes;
