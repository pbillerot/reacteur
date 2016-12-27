/*
Google JSON guide

Success response return data
{
  "data": {
    "id": 1001,
    "name": "Wing"
  }
}

Error response return error
{
  "error": {
    "code": 404,
    "message": "ID not found"
  }
}
{status: "rejected", result: "Fetch is not yet implemented"}
*/

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')

//var fetch = require('fetch-cookie')(require('node-fetch'))

const Dico = require('../config/Dico')

// traitement des REST API
router.get('/portail', function (req, res) {
  var session = req.session
  session.user_agent = req.headers['user-agent']
  let path = __dirname + '/../views/portail.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})
router.get('/help', function (req, res) {
  var session = req.session
  session.user_agent = req.headers['user-agent']
  let path = __dirname + '/../views/help.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})

router.post('/:table/:view/:form/:id', function (req, res) {
  //console.log(req.url)
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
          console.error("ERROR", err, sql)
          if (err.errno == 19) {
            res.status(200).json({ code: 4001, message: 'La référence existe déjà' });
          } else {
            res.status(500).json({ code: 5001, message: 'Erreur DATABASE sur le serveur' });
          }
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json({ code: 2001, message: result.changes }) // OK
  })
})

router.put('/:table/:view/:form', function (req, res) {
  //console.log(req.url)
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].rubs
  let key_name = Dico.tables[req.params.table].key

  let data = req.body
  let sql = '('
  let bstart = true;
  Object.keys(fields).forEach((key) => {
    //if (key != key_name) {
    if (!Dico.isRubTemporary(key)) {
      sql += !bstart ? ", " : ""
      sql += "'" + key + "'"
      bstart = false;
    }
    //}
  })
  sql += ') VALUES ('
  bstart = true;
  Object.keys(fields).forEach((key) => {
    //if (key != key_name) {
    if (!Dico.isRubTemporary(key)) {
      sql += !bstart ? ", " : ""
      sql += "'" + data[key] + "'"
      bstart = false;
    }
    //}
  })
  sql += ')'
  sql = 'INSERT INTO ' + req.params.table + ' ' + sql
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename);
  var result = (callback) => {
    db.serialize(function () {
      db.run(sql, [], function (err) {
        if (err) {
          console.error("ERROR", err, sql)
          if (err.errno == 19) {
            res.status(200).json({ code: 4001, message: 'La référence existe déjà' });
          } else {
            res.status(500).json({ code: 5001, message: 'Erreur DATABASE sur le serveur' });
          }
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json({ code: 2001, message: result.changes }) // OK
  })
})

router.delete('/:table/:view/:form/:id', function (req, res) {
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].rubs
  let key_name = Dico.tables[req.params.table].key

  let data = req.body
  let sql = 'DELETE FROM ' + req.params.table
    + " WHERE " + key_name + " = '" + req.params.id + "'"
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename);
  var result = (callback) => {
    db.serialize(function () {
      db.run(sql, [], function (err) {
        if (err) {
          console.error("ERROR", err, sql)
          res.status(500).json({ code: 5001, message: 'Erreur DATABASE sur le serveur' });
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json({ code: 2001, message: result.changes }) // OK
  })
})

router.get('/form/:table/:view/:form/:id', function (req, res) {
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

router.get('/view/:table/:view', function (req, res) {
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
    //console.log(JSON.stringify(tableur))
    res.json(JSON.stringify(tableur))
  })

})

module.exports = router;
