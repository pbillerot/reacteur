'use strict';

import path from 'path';
import { Server } from 'http';
import Express from 'express';
import React from 'react';

const fs = require('fs')

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../app/routes';
import PageNotFound from '../app/components/PageNotFound';

import Dico from './config/Dico.js';

// Composants SERVER

//const winston = require('winston')

// var logger = new (winston.Logger)({
//     transports: [
//       new (winston.transports.Console)(),
//       new (winston.transports.File)({ filename: 'server.log' })
//     ]
// });
// logger.info('Start...')
console.log("Go...", __dirname)

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

// traitement des REST API
app.get('/api/help', function (req, res) {
  console.log(req.url)
  let path = __dirname + '/views/help.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));  
})

app.get('/api/view/:table/:view', function (req, res) {
  console.log(req.url)
  let path = __dirname + '/data/' + req.params.table + '.json';
  let data = fs.readFileSync(path, 'utf8');
  res.json(data)
})

// universal routing and rendering
app.get('*', (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {

      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(<RouterContext {...renderProps} />);
      } else {
        // otherwise we can render a 404 page
        markup = renderToString(<PageNotFound />);
        res.status(404);
      }

      // render the index template with the embedded React markup
      return res.render('index', { markup });
    }
  );
});

// start the server
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return logger.error(err);
  }
  //logger.info(`Server running on http://localhost:${port} [${env}]`)
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
