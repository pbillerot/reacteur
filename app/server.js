'use strict';

import path from 'path';
import http from 'http';
import https from 'https';
import Express from 'express';
import morgan from 'morgan';

import bodyParser from 'body-parser';
import helmet from 'helmet';
import React from 'react';

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../app/routes';
import PageNotFound from '../app/components/PageNotFound';

const fs = require('fs')
const options = {
  key: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/privkey.pem'),
  cert: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/cert.pem'),
  ca: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/chain.pem'),
};

// initialize the server and configure support for ejs templates
var app = new Express();
var server = https.createServer(options, app); // HTTPS
//var server = http.createServer(app); // HTTP
//var server = new Server(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('trust proxy', 1) // trust first proxy
app.use(morgan('short'))
app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

// SESSION
// Un server REDIS a été installé sur la machine
// sudo apt install redis-server
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
app.use(session({
  store: new RedisStore({ host: '127.0.0.1', port: 6379 }),
  //path: '/',
  secret: 'sse2-Excr',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000,
    httpOnly: true,
    secure: true,
    //domain: 'pbillerot.freeboxos.fr',
  }
}))
app.use(function (req, res, next) {
  //console.log(res)
  //res.setHeader('Access-Control-Allow-Credentials', 'true')
  var sess = req.session
  if ( sess.count ) {
    sess.count += 1
    //console.log(sess.id, sess.count)
  } else {
    sess.count = 1
    console.log('SESSION Connection de', sess.id)
  }
  next()
})

//app.use(multer());
// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));
app.use('/favicon.ico', Express.static('favicon.ico'));

// Traitement des appels API
const api = require('./server/api');
app.use('/api', api);

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
const port = process.env.PORT || 8443; // HTTPS
//const port = process.env.PORT || 3000; // HTTP
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  //console.log(`Server running on http://localhost:${port} [${env}]`) // HTTP
  console.log(`Server running on https://localhost:${port} [${env}]`) // HTTPS
});
