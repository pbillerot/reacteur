'use strict';

import path from 'path';
import { Server } from 'http';
import Express from 'express';
import bodyParser from 'body-parser';
//import multer from 'multer';
import React from 'react';

const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
//const Store = require('jfs')

import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../app/routes';
import PageNotFound from '../app/components/PageNotFound';

import Dico from './config/Dico.js';

// Composants SERVER

console.log("Go...", __dirname)

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer());
// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

// traitement des REST API
app.get('/api/help', function (req, res) {
  console.log(req.url)
  let path = __dirname + '/views/help.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})

app.post('/api/form/:table/:view/:form/:id', function (req, res) {
  console.log(req.url)
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].rubs
  let key_name = Dico.tables[req.params.table].key

  let data = req.body
  let sql = ''
  Object.keys(fields).forEach((key) => {
    if (!Dico.isRubTemporary(key)) {
      sql += sql.length > 0 ? ", " : ""
      sql += key + " = '" + data[key] + "'"
    }
  })
  sql = 'UPDATE ' + req.params.table + ' SET ' + sql
  sql += " WHERE " + key_name + " = '" + req.params.id + "'"
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename);
  var result = (callback) => {
    db.serialize(function () {
      db.run(sql, [], function (err) {
        if (err) {
          console.log("ERR: " + sql)
          res.status('500').json({message: err})
          return
          //throw err
        }
        console.log("UPDATE: " + JSON.stringify(this, null, 4))
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status('200').json({error: 'Ya une coquille!!!', message: 'ce bon'}) // OK
    //res.status('400').json({message: 'Ya une coquille!!!'}) // OK
  })
  //res.status('400').json({message: 'KO'}) // bad request
  //res.status('500').json({message: 'KO'}) // Internal Server Error
  //res.status('200').json({message: 'OK'}) // OK 
})

app.get('/api/form/:table/:view/:form/:id', function (req, res) {
  console.log(req.url)
  let select = ''
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].rubs
  let key_name = Dico.tables[req.params.table].key

  Object.keys(fields).forEach((key) => {
    if (!Dico.isRubTemporary(key)) {
      select += select.length > 0 ? ', ' + key : key
      fields[key].value = ''
    }
    //console.log(key + ': ' + JSON.stringify(rubs[key], null, 4))
  })
  //console.log(select)
  select = 'SELECT ' + select + ' FROM ' + req.params.table
  select += " WHERE " + key_name + " = '" + req.params.id + "'"
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename, sqlite3.OPEN_READONLY);
  var result = (callback) => {
    db.serialize(function () {
      db.all(select, function (err, rows) {
        if (err) throw err
        console.log("FORM: " + JSON.stringify(this, null, 4))
        callback(rows)
      });
      db.close()
    });
  }
  result((rows) => {
    Object.keys(fields).map(key => {
      if (!Dico.isRubTemporary(key)) {
        fields[key].value = rows[0][key]
      } else {
        fields[key].value = ''
      }
    })
    console.log(fields)
    res.json(JSON.stringify(fields))
  })

})

app.get('/api/view/:table/:view', function (req, res) {
  console.log(req.url)
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename, sqlite3.OPEN_READONLY);
  let select = ''
  let rubs = Dico.tables[req.params.table].rubs
  let cols = Dico.tables[req.params.table].views[req.params.view].rubs
  let key_name = Dico.tables[req.params.table].key
  Object.keys(cols).forEach((key) => {
    if (!Dico.isRubTemporary(key))
      select += select.length > 0 ? ', ' + key : key
  })
  select = 'SELECT ' + select + ' FROM ' + req.params.table
  var result = (callback) => {
    db.serialize(function () {
      db.all(select, function (err, rows) {
        if (err) {
          console.log("VIEW: " + select)
          throw err
        }
        //console.log("VIEW: " + JSON.stringify(this, null, 4))
        callback(rows)
      });
      db.close()
    });
  }
  result((rows) => {
    //console.log(JSON.stringify(rows))
    var tableur = []
    rows.forEach((row) => {
      // insertion des colonnes des rubriques temporaires
      let ligne = {}
      let key_value = ''
      Object.keys(cols).forEach(key => {
        if (key == key_name) {
          key_value = row[key]
        }
        if (Dico.isRubTemporary(key)) {
          ligne[key] = key_value
        } else {
          ligne[key] = row[key]
        }
      })
      tableur.push(ligne)
    })
    console.log(JSON.stringify(tableur))
    res.json(JSON.stringify(tableur))
  })

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
