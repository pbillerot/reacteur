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
const nodemailer = require('nodemailer')
const markdown = require('nodemailer-markdown').markdown;
import randomstring from 'randomstring'
import moment from 'moment'

import { Data, Dico, Tools } from '../config/Dico';

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
 * CRUD
 */
crud_update: (db, sql, callback) => {
  console.log('crud_update:',sql)
  db.serialize(function () {
    db.run(sql, [], function (err) {
      if (err) {
        console.error("ERROR", err, sql)
        if (err.errno == 19) {
          return callback(message.m4001);
        } else {
          return callback(message.m5001);
        }
      }
      return callback(message.m2005)
    });
    db.close()
  });
}

/**
 * Mise à jour d'un enregistreemnt
 */
router.post('/:table/:view/:form/:id', function (req, res) {
  // Ctrl session
  let session = req.session
  if (!session || !session.user_pseudo || session.user_pseudo.length < 3) {
    res.status(400).json(message.m9901)
    return
  }

  let formulaire = Dico.tables[req.params.table].forms[req.params.form]
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].fields
  let key_name = Dico.tables[req.params.table].key
  Data.fields = fields

  // Ctrl accès au formulaire
  let bret = false
  if (formulaire.group) {
    let groups = session.user_profil.split(',')
    groups.forEach(group => {
      if (group == formulaire.group)
        bret = true
    })
  } else {
    bret = true
  }
  if (!bret) {
    let result = message.m9903
    res.status(400).json(result) // KO
    return
  }

  // Recup des valeurs transmises
  let data = req.body
  Object.keys(fields).forEach((key) => {
    fields[key].value = ''
    if (data[key]) {
      fields[key].value = data[key]
    }
    if (!fields[key].is_read_only) {
      fields[key].is_read_only = false
    }
  })

  // calcul du formulaire
  if (formulaire.computeForm) {
    formulaire.computeForm()
  }

  // Ctrl intrinséque des champs
  bret = true
  let errors = []
  Object.keys(fields).forEach((key) => {
    if (rubs[key].is_valide) {
      if (!rubs[key].is_valide(fields[key].value)) {
        bret = false
        errors.push(rubs[key].error)
      }
    }
  })
  if (!bret) {
    let result = message.m4005
    result.message = errors.join()
    res.status(400).json(result) // KO
    return
  }
  // *** Les champs sont CORRECTS

  // ctrl du formulaire
  if (formulaire.is_valide) {
    bret = formulaire.is_valide()
  }
  if (!bret) {
    let result = message.m4006
    result.message = formulaire.error
    res.status(400).json(result) // KO
    return
  }
  // *** Le formulaire est CORRECT

  // Transformation des values en record
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      fields[key].record_value = fields[key].value // par défaut record_value = value
      if (rubs[key].srv_record)
        fields[key].record_value = rubs[key].srv_record(fields[key].value)
    }
  })

  // construction de l'ordre sql
  let sql = ""
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      sql += sql.length > 0 ? ", " : ""
      sql += key + " = '" + fields[key].record_value + "'"
    }
  })

  // si pas de champ de la table en maj
  // on réalise seulement les ordres postUpdate
  if (sql.length < 2) {
    postUpdate(formulaire, rubs, fields, (result) => {
      if (result.code < 4000) {
        res.status(200).json(result) // OK
      } else {
        res.status(400).json(result) // KO
      }
    })
    return
  }

  sql = 'UPDATE ' + req.params.table + ' SET ' + sql
  sql += " WHERE " + key_name + " = '" + req.params.id + "'"
  //console.log(sql)
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
    postUpdate(formulaire, rubs, fields, (result) => {
      if (result.code < 4000) {
        res.status(200).json(result) // OK
      } else {
        res.status(400).json(result) // KO
      }
    })
  })
})

/**
 * Création d'un enregistreement
 */
router.put('/:table/:view/:form', function (req, res) {
  // Ctrl session
  let session = req.session
  if (req.params.view != 'vident' && req.params.form != 'fnew' 
    && (!session || !session.user_pseudo || session.user_pseudo.length < 3)) {
    if (req.params.form != 'forgetpwd') {
      res.status(400).json(message.m9901)
      return
    }
  }

  let rubs = Dico.tables[req.params.table].rubs
  let formulaire = Dico.tables[req.params.table].forms[req.params.form]
  let fields = formulaire.fields
  let key_name = Dico.tables[req.params.table].key
  Data.fields = fields

  // Ctrl accès au formulaire
  let bret = false
  if (formulaire.group) {
    let groups = session.user_profil.split(',')
    groups.forEach(group => {
      if (group == formulaire.group)
        bret = true
    })
  } else {
    bret = true
  }
  if (!bret) {
    let result = message.m9903
    res.status(400).json(result) // KO
    return
  }

  // Recup des valeurs transmises
  let data = req.body
  //console.log('put', data)
  Object.keys(fields).forEach((key) => {
    fields[key].value = ''
    if (data[key]) {
      fields[key].value = data[key]
    }
    if (!fields[key].is_read_only) {
      fields[key].is_read_only = false
    }
  })

  // calcul du formulaire
  if (formulaire.computeForm) {
    formulaire.computeForm()
  }

  // Ctrl intrinséque des champs
  bret = true
  let errors = []
  Object.keys(fields).forEach((key) => {
    if (rubs[key].is_valide) {
      if (!rubs[key].is_valide(fields[key].value)) {
        bret = false
        errors.push(rubs[key].error)
      }
    }
  })
  if (!bret) {
    let result = message.m4005
    result.message = errors.join()
    res.status(400).json(result) // KO
    return
  }
  // *** Les champs sont CORRECTS

  // ctrl du formulaire
  if (formulaire.is_valide) {
    bret = formulaire.is_valide()
  }
  if (!bret) {
    let result = message.m4006
    result.message = formulaire.error
    res.status(400).json(result) // KO
    return
  }
  // *** Le formulaire est CORRECT

  // Transformation des values en record
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      fields[key].record_value = fields[key].value // par défaut record_value = value
      if (rubs[key].srv_record)
        fields[key].record_value = rubs[key].srv_record(fields[key].value)
    }
  })
  //console.log(fields)

  let sql = '('
  let bstart = true;
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      sql += !bstart ? ", " : ""
      sql += "'" + key + "'"
      bstart = false;
    }
  })

  // si pas de champ de la table en maj on arrête
  if (sql.length < 2) {
    postUpdate(formulaire, rubs, fields, (result) => {
      if (result.code < 4000) {
        res.status(200).json(result) // OK
      } else {
        res.status(400).json(result) // KO
      }
    })
    return
  }

  sql += ') VALUES ('
  bstart = true;
  Object.keys(fields).forEach((key) => {
    //if (key != key_name) {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      sql += !bstart ? ", " : ""
      sql += "'" + fields[key].record_value + "'"
      bstart = false;
    }
    //}
  })
  sql += ')'
  sql = 'INSERT INTO ' + req.params.table + ' ' + sql
  //console.log(sql)
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
    postUpdate(formulaire, rubs, fields, (result) => {
      if (result.code < 4000) {
        res.status(200).json(result) // OK
      } else {
        res.status(400).json(result) // KO
      }
    })
  })
})

/**
 * Suppression d'un enregistrement
 */
router.delete('/:table/:view/:form/:id', function (req, res) {
  // Ctrl session ouverte
  let session = req.session
  if (!session || !session.user_pseudo || session.user_pseudo.length < 3) {
    res.status(400).json(message.m9901)
    return
  }

  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].fields
  let key_name = Dico.tables[req.params.table].key
  let formulaire = Dico.tables[req.params.table].forms[req.params.form]
  Data.fields = fields

  // Ctrl accès au formulaire
  let bret = false
  if (formulaire.group) {
    let groups = session.user_profil.split(',')
    groups.forEach(group => {
      if (group == formulaire.group)
        bret = true
    })
  } else {
    bret = true
  }
  if (!bret) {
    let result = message.m9903
    res.status(400).json(result) // KO
    return
  }

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

router.get('/form/:table/:view/:form/:id', function (req, res) {
  let rubs = Dico.tables[req.params.table].rubs
  let fields = Dico.tables[req.params.table].forms[req.params.form].fields
  let key_name = Dico.tables[req.params.table].key
  let formulaire = Dico.tables[req.params.table].forms[req.params.form]
  Data.fields = fields

  // Ctrl accès au formulaire
  let bret = false
  //console.log('form', formulaire)
  if (formulaire.group) {
    if (formulaire.group.length > 0) {
      // Ctrl session
      let session = req.session
      if (!session || !session.user_pseudo || session.user_pseudo.length < 3) {
        res.status(400).json(message.m9901)
        return
      }
      let groups = session.user_profil.split(',')
      groups.forEach(group => {
        if (group == formulaire.group)
          bret = true
      })
    }
  } else {
    bret = true
  }
  if (!bret) {
    let result = message.m9903
    res.status(400).json(result) // KO
    return
  }

  // construction de l'ordre sql
  let sql = ''
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key)) {
      sql += sql.length > 0 ? ', ' + key : key
      fields[key].value = ''
    }
  })
  if (sql.length > 0) {
    sql = 'SELECT ' + sql + ' FROM ' + req.params.table
    sql += " WHERE " + key_name + " = '" + req.params.id + "'"
    //console.log(sql)
    let db = new sqlite3.Database(Dico.tables[req.params.table].basename, sqlite3.OPEN_READONLY);
    var result = (callback) => {
      db.serialize(function () {
        db.all(sql, function (err, rows) {
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
  } else {
    // aucun champ en maj
    res.json({})
  }
  result((rows) => {
    Object.keys(fields).map(key => {
      if (!Tools.isRubTemporary(key)) {
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
  let cols = Dico.tables[req.params.table].views[req.params.view].cols
  let key_name = Dico.tables[req.params.table].key
  let vue = Dico.tables[req.params.table].views[req.params.view]

  // Ctrl accès à la vue
  let bret = false
  if (vue.group) {
    if (vue.group.length > 0) {
      // Ctrl session
      let session = req.session
      if (!session || !session.user_pseudo || session.user_pseudo.length < 3) {
        res.status(400).json(message.m9901)
        console.error(message.m9901)
        return
      }
      let groups = session.user_profil.split(',')
      groups.forEach(group => {
        if (group == vue.group)
          bret = true
      })
    }
  } else {
    bret = true
  }
  if (!bret) {
    let result = message.m9902
    res.status(400).json(result) // KO
    console.error(result)
    return
  }

  Object.keys(cols).forEach((key) => {
    if (!Tools.isRubTemporary(key))
      select += select.length > 0 ? ', ' + key : key
  })
  select = 'SELECT ' + select + ' FROM ' + req.params.table
  var result = (callback) => {
    db.serialize(function () {
      db.all(select, function (err, rows) {
        if (err) {
          console.error("ERROR", err, select)
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
        if (Tools.isRubTemporary(key)) {
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
  let user_pseudo = req.body['user_pseudo']
  let user_pwd = req.body['user_pwd']

  let sql = "select user_email, user_profil, user_pwd from ACTUSERS where user_pseudo = ? "
  let db = new sqlite3.Database(Dico.tables['actusers'].basename)
  var result = (callback) => {
    db.serialize(function () {
      db.all(sql, [user_pseudo], function (err, rows) {
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
          db.all("UPDATE ACTUSERS SET user_pwd = ? WHERE user_pseudo = ?", [md5(user_pwd), user_pseudo],
            function (err) {
              if (err) {
                console.error("ERROR", err)
                res.status(500).json(message.m5001);
                return
              }
              res.status(200).json(message.m2002) // OK  
              console.log('cnx new pwd : ' + user_pseudo)
            })
          db.close()
        });

      } else {
        if (md5(user_pwd) != pwdmd5) {
          res.status(400).json(message.m4002)
          console.log('ERROR - cnx pwd ko : ' + user_pseudo)
        } else {
          // User OK
          var session = req.session
          session.user_pseudo = user_pseudo
          session.user_email = user_email
          session.user_profil = user_profil
          res.status(200).json(message.m2003) // OK
          console.log('cnx ok : ' + user_pseudo)
        }
      }
    } else {
      res.status(400).json(message.m4004)
      console.log('ERROR - cnx user not found : ' + user_pseudo)
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
  //console.log(req.session.user_pseudo, req.session.id, req.session.count)
})

/**
 * Ouverture d'une session et la route à suivre
 */
router.get('/token/:token', function (req, res) {
})

/**
 * Demande d'un token à associer au user et à une url
 */
router.put('/token/:url/:user_email', function (req, res) {
  console.log(req.url)
  let token = randomstring.generate(23)
  let sql = "INSERT INTO ACTTOKENS (tok_id, tok_url, tok_email) VALUES ("
  + "'" + token + "'"
  + ",'" + req.params.url + "'"
  + ",'" + req.params.user_email + "'"
  let db = new sqlite3.Database(Dico.tables['acttokens'].basename)
  crud_update(db, sql, (result) => {
    if ( result.code < 4000 ) {
      res.status(200).json({token: token})
    } else {
      res.status(500).json(result)
    }
  })
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
  m2008: { code: 2008, message: "Aucune mise à jour à réalisée" },
  m2009: { code: 2009, message: "postUpdate OK" },

  m4001: { code: 4001, message: "La référence existe déjà" },
  m4002: { code: 4002, message: "Mot de passe erroné" },
  m4004: { code: 4004, message: "Compte pseudo inconnu" },
  m4005: { code: 4005, message: "" },
  m4006: { code: 4006, message: "" },
  m4009: { code: 4009, message: "postUpdate K0" },

  m5001: { code: 5001, message: "Erreur DATABASE sur le serveur" },

  m9901: { code: 9901, message: "Accès refusé, session non ouverte" },
  m9902: { code: 9902, message: "Accès refusé à la vue" },
  m9903: { code: 9903, message: "Accès refusé au formulaire" },
  m9904: { code: 9904, message: "Accès refusé à la rubrique" },

}
module.exports = router;

function postUpdate(formulaire, rubs, fields, callback) {
  //console.log('postUpdate', formulaire)

  // Envoi des emails seulement en postUpdate
  Object.keys(fields).forEach(field => {
    //console.log(field)
    switch (rubs[field].type) {
      case 'mail':
        sendMail(rubs[field], fields[field], (result) => {
          //console.log('sendMail', result)
          if (result.ok == false) {
            message.m4009.message = result.message
            return callback(message.m4009)
          } else {
            message.m2009.message = result.message
            return callback(message.m2009)
          }
        })
        break
      default:
        break
    }
    return callback(message.m2009)
  })
}

/**
 * Envoi de mails
 * https://github.com/nodemailer/nodemailer
 */
function sendMail(rub, field, callback) {
  let transport = nodemailer.createTransport(Dico.config.smtpConfig)
  transport.use('compile', markdown())
  let mail = rub.mail()

  if (!mail.from)
    mail.from = Dico.config.from

  console.log('sendMail', mail)

  transport.sendMail(mail).then(function (info) {
    console.log(info);
    return callback({ ok: true, message: info.response })
  }).catch(function (err) {
    console.log(err);
    return callback({ ok: false, message: err.response })
  });

}
