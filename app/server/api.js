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
const md5 = require('js-md5')
const fs = require('fs')

const Dico = require('../config/Dico')

/**
 * Appel du portail
 */
router.get('/portail', function (req, res) {
  var session = req.session
  let path = __dirname + '/../views/portail.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})

/**
 * Appel de l'aide
 */
router.get('/help', function (req, res) {
  var session = req.session
  let path = __dirname + '/../views/help.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})

/**
 * Mise à jour d'un enregistreemnt
 */
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
  console.log(sql)
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename);
  var result = (callback) => {
    db.serialize(function () {
      db.run(sql, [], function (err) {
        if (err) {
          console.error("ERROR", err, sql)
          if (err.errno == 19) {
            res.status(400).json(message.m4001);
          } else {
            res.status(500).json(message.m5001);
          }
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json(message.m2005) // OK
  })
})

/**
 * Création d'un enregistreement
 */
router.put('/:table/:view/:form', function (req, res) {
  //console.log(req.url)
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].rubs
  let key_name = Dico.tables[req.params.table].key

  let data = req.body
  console.log(data)

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
  console.log(sql)
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename);
  var result = (callback) => {
    db.serialize(function () {
      db.run(sql, [], function (err) {
        if (err) {
          console.error("ERROR", err, sql)
          res.status(500).json(message.m5001);
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json(message.m2006) // OK
  })
})

/**
 * Suppression d'un enregistrement
 */
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
          res.status(500).json(message.m5001);
          return
        }
        callback(this)
      });
      db.close()
    });
  }
  result((result) => {
    res.status(200).json(message.m2004) // OK
  })
})

/**
 * Lecture d'un enregistrement
 */
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
  })
  select = 'SELECT ' + select + ' FROM ' + req.params.table
  select += " WHERE " + key_name + " = '" + req.params.id + "'"
  let db = new sqlite3.Database(Dico.tables[req.params.table].basename, sqlite3.OPEN_READONLY);
  var result = (callback) => {
    db.serialize(function () {
      db.all(select, function (err, rows) {
        if (err) {
          console.error("ERROR", err, sql)
          res.status(500).json(message.m5001);
          return
        }
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
    //console.log(fields)
    res.json(JSON.stringify(fields))
  })

})

/**
 * Lecture d'une vue
 */
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
          console.error("ERROR", err, this)
          res.status(500).json(message.m5001);
          return
        }
        callback(rows)
      });
      db.close()
    });
  }
  result((rows) => {
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

/**
 * Connexion Identification
 */
router.put('/cnx/ident', function (req, res) {
  //console.log(req.url)
  let user_id = req.body['user_id']
  let user_pwd = req.body['user_pwd']

  let sql = "select user_email, user_profil, user_pwd from ACTUSERS where user_id = ? "
  let db = new sqlite3.Database(Dico.tables['actusers'].basename)
  var result = (callback) => {
    db.serialize(function () {
      db.all(sql, [user_id], function (err, rows) {
        if (err) {
          console.error("ERROR", err, sql)
          res.status(500).json(message.m5001);
          return
        }
        callback(rows)
      })
      db.close()
    });
  }
  result((rows) => {
    //console.log('rows', rows)
    let pwdmd5 = ''
    let user_email = ''
    let user_profil = ''
    if (rows.length > 0) {
      rows.forEach((row) => {
        pwdmd5 = row.user_pwd
        user_email = row.user_email
        user_profil = row.user_profil
      })
      if (pwdmd5 == '') {
        // initialisation du mot de passe
        db = new sqlite3.Database(Dico.tables['actusers'].basename)
        db.serialize(function () {
          db.all("UPDATE ACTUSERS SET user_pwd = ? WHERE user_id = ?", [md5(user_pwd), user_id],
            function (err) {
              if (err) {
                console.error("ERROR", err)
                res.status(500).json(message.m5001);
                return
              }
              res.status(200).json(message.m2002) // OK  
              console.log('cnx new pwd : ' + user_id)
            })
          db.close()
        });

      } else {
        if (md5(user_pwd) != pwdmd5) {
          res.status(400).json(message.m4002)
          console.log('ERROR - cnx pwd ko : ' + user_id)
        } else {
          // User OK
          var session = req.session
          session.user_id = user_id
          session.user_email = user_email
          session.user_profil = user_profil
          res.status(200).json(message.m2003) // OK
          console.log('cnx ok : ' + user_id)
        }
      }
    } else {
      res.status(400).json(message.m4004)
      console.log('ERROR - cnx user not found : ' + user_id)
    }
  })
})

/**
 * Connexion Fermeture
 */
router.put('/cnx/close', function (req, res) {
  req.session.destroy(function (err) {
    // will have a new session here
    if (err)
      console.log('ERROR', err)
  })
  res.status(200).json(message.m2007);
})

router.get('/session', function (req, res) {
  res.status(200).json(req.session) // OK
  //console.log(req.session.user_id, req.session.id, req.session.count)
})

/**
 * Messages retour du serveur
 */
let message = {
  m2002: { code: 2002, message: "Le mot de passe a été enregistré" },
  m2003: { code: 2003, message: "Mot de passe correct" },
  m2004: { code: 2004, message: "Suppression réalisée avec succès" },
  m2005: { code: 2005, message: "Mise à jour réalisée avec succès" },
  m2006: { code: 2006, message: "Création réalisée avec succès" },
  m2007: { code: 2007, message: "La connexion a été fermée" },

  m4001: { code: 4001, message: "La référence existe déjà" },
  m4002: { code: 4002, message: "Mot de passe erroné" },
  m4003: { code: 4003, message: "" },
  m4004: { code: 4004, message: "Compte pseudo inconnu" },

  m5001: { code: 5001, message: "Erreur DATABASE sur le serveur" },
}
module.exports = router;
