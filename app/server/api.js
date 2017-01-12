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
 * Mise à jour d'un enregistreemnt
 */
router.post('/:table/:view/:form/:id', function (req, res) {
  //console.log(req.url)
  // Ctrl session
  let session = req.session
  if (!session || !session.user_pseudo || session.user_pseudo.length < 3) {
    res.status(400).json(message.m9901)
    console.log(message.m9901)
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
    console.log(result)
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
    console.log(result)
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
    console.log(result)
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

  // construction de l'ordre sql et des paramètres
  let sql = ""
  let params = {}
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      sql += sql.length > 0 ? ", " : ""
      sql += key + " = $" + key
      params['$' + key] = fields[key].record_value
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
        console.log(result)
      }
    })
    return
  }

  sql = 'UPDATE ' + req.params.table + ' SET ' + sql
  sql += " WHERE " + key_name + " = $" + key_name
  params['$' + key_name] = req.params.id
  sqlUpdate(Dico.tables[req.params.table].basename, sql, params, result => {
    if (result.ok == false) {
      if (result.message.errno == 19) {
        res.status(400).json(message.m4001);
      } else {
        res.status(500).json(message.m5001);
      }
    } else {
      postUpdate(formulaire, rubs, fields, (result) => {
        if (result.code < 4000) {
          res.status(200).json(result) // OK
        } else {
          res.status(400).json(result) // KO
          console.log(result)
        }
      })
    }
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
  let params = {}
  let sql = '('
  let bstart = true;
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key) && fields[key].is_read_only == false) {
      sql += !bstart ? ", " : ""
      //sql += "'" + req.params.table + "." + key + "'"
      sql += key
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
      sql += "$" + key
      bstart = false;
      params['$' + key] = fields[key].record_value
    }
    //}
  })
  sql += ')'
  sql = 'INSERT INTO ' + req.params.table + ' ' + sql
  //console.log(sql)
  sqlUpdate(Dico.tables[req.params.table].basename, sql, params, result => {
    if (result.ok == false) {
      if (result.message.errno == 19) {
        res.status(400).json(message.m4001);
      } else {
        res.status(500).json(message.m5001);
      }
    } else {
      postUpdate(formulaire, rubs, fields, (result) => {
        if (result.code < 4000) {
          res.status(200).json(result) // OK
        } else {
          res.status(400).json(result) // KO
          console.log(result)
        }
      })
    }
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

  let sql = 'DELETE FROM ' + req.params.table
    + " WHERE " + key_name + " = $" + key_name
  let params = {}
  params['$' + key_name] = req.params.id

  sqlUpdate(Dico.tables[req.params.table].basename, sql, params, result => {
    if (result.ok == false) {
      if (result.message.errno == 19) {
        res.status(400).json(message.m4001);
      } else {
        res.status(500).json(message.m5001);
      }
    } else {
      postUpdate(formulaire, rubs, fields, (result) => {
        if (result.code < 4000) {
          res.status(200).json(result) // OK
        } else {
          res.status(400).json(result) // KO
          console.log(result)
        }
      })
    }
  })
})

/**
 * Lecture d'un enregistrement
 */
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

  // construction de l'ordre sql et des paramètres
  let params = {}
  let sql = ''
  Object.keys(fields).forEach((key) => {
    if (!Tools.isRubTemporary(key)) {
      sql += sql.length > 0 ? ', ' + req.params.table + "." + key : req.params.table + "." + key
    }
    fields[key].value = ''
  })
  if (sql.length > 0) {
    sql = 'SELECT ' + sql + ' FROM ' + req.params.table
    sql += " WHERE " + key_name + " = $" + key_name
    params['$' + key_name] = req.params.id
    sqlSelect(Dico.tables[req.params.table].basename, sql, params, result => {
      if (result.ok == false) {
        res.status(500).json(message.m5001);
      } else {
        Object.keys(fields).map(key => {
          if (!Tools.isRubTemporary(key)) {
            fields[key].value = result.rows[0][key]
          }
        })
        res.status(200).json(JSON.stringify(fields))
      }
    })
  } else {
    // aucun champ en maj
    res.status(200).json({})
  }
})

/**
 * Lecture d'une vue
 */
router.get('/view/:table/:view', function (req, res) {
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

  // Construction de l'ordre sql et des params
  let sql = ''
  let params = {}
  Object.keys(cols).forEach((key) => {
    if (!Tools.isRubTemporary(key))
      sql += sql.length > 0 ? ', ' + req.params.table + "." + key : req.params.table + "." + key
  })
  sql = 'SELECT ' + sql + ' FROM ' + req.params.table
  sqlSelect(Dico.tables[req.params.table].basename, sql, params, result => {
    if (result.ok == false) {
      res.status(500).json(message.m5001);
    } else {
      let tableur = []
      result.rows.forEach((row) => {
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
      res.status(200).json(JSON.stringify(tableur))
    }
  })
})

/**
 * Connexion Authentification
 */
router.put('/cnx/ident', function (req, res) {
  //console.log(req.url)
  let user_pseudo = req.body['user_pseudo']
  let user_pwd = req.body['user_pwd']

  let sql = "select user_email, user_profil, user_pwd from ACTUSERS where user_pseudo = $user_pseudo"
  let params = { $user_pseudo: user_pseudo }
  let basename = Dico.tables['actusers'].basename

  sqlSelect(basename, sql, params, result => {
    if (result.ok == false) {
      res.status(500).json(message.m5001);
    } else {
      // OK
      let pwdmd5 = ''
      let user_email = ''
      let user_profil = ''
      if (result.rows.length > 0) {
        result.rows.forEach((row) => {
          pwdmd5 = row.user_pwd
          user_email = row.user_email
          user_profil = row.user_profil
        })
        if (md5(user_pwd) != pwdmd5) {
          res.status(400).json(message.m4002)
          console.log(user_pseudo, message.m4002)
        } else {
          // User OK
          let session = req.session
          session.user_pseudo = user_pseudo
          session.user_email = user_email
          session.user_profil = user_profil
          res.status(200).json(message.m2003) // OK
          console.log(user_pseudo, message.m2003)
        }
      } else {
          res.status(400).json(message.m4004)
          console.log(user_pseudo, message.m4004)        
      }
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
router.get('/toctoc/:token', function (req, res) {
})

/**
 * Demande d'un token à associer au user et à une url
 */
router.put('/toctoc/:url/:user_email', function (req, res) {
  console.log(req.url)
  let token = randomstring.generate(23)
  let sql = "INSERT INTO ACTTOKENS (tok_id, tok_url, tok_email) VALUES ("
    + "'" + token + "'"
    + ",'" + req.params.url + "'"
    + ",'" + req.params.user_email + "'"
  let db = new sqlite3.Database(Dico.tables['acttokens'].basename)
  crud_update(db, sql, (result) => {
    if (result.code < 4000) {
      res.status(200).json({ token: token })
    } else {
      res.status(500).json(result)
    }
  })
})

router.get('/server', function (req, res) {
  // sqlSelect(Dico.tables.actusers.basename, 
  //   "select * from actusers where user_pseudo = $user_pseudo", 
  //   {$user_pseudo: 'pbillerot'}, result => {
  //     console.log(result)
  // })
  // sqlUpdate(Dico.tables.actusers.basename,
  //   "update actusers set user_actif = $usser_actif where user_pseudo = $user_pseudo",
  //   { $user_pseudo: 'aaa', $user_actif: 0 }, result => {
  //     console.log(result)
  //   })
  res.status(200).json({ host: req.protocol + '://' + req.get('host') })
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
  let messages = []
  // Envoi des emails seulement en postUpdate
  Object.keys(fields).forEach(field => {
    //console.log(field)
    switch (rubs[field].type) {
      case 'mail':
        sendMail(rubs[field], fields[field], (result) => {
          //console.log('sendMail', result)
          if (result.ok == false) {
            messages.push(result.message)
          }
        })
        break
      default:
        break
    }
  })
  if (messages.length == 0) {
    return callback(message.m2009)
  } else {
    message.m4009.message = messages.join()
    return callback(message.m4009)
  }

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

/**
 * CRUD
 */
function sqlUpdate(pathFileSqlite, sql, params, callback) {
  let db = new sqlite3.Database(pathFileSqlite)
  db.serialize(function () {
    db.run(sql, params, function (err) {
      if (err) {
        console.error(err, 'SQL: ' + sql, 'PARAMS: ' + JSON.stringify(params))
        return callback({ ok: false, message: err })
      }
      console.log('sqlUpdate:', this, JSON.stringify(params))
      return callback({ ok: true, lastID: this.lastID, changes: this.changes })
    }).close()
  });
}

function sqlSelect(pathFileSqlite, sql, params, callback) {
  let db = new sqlite3.Database(pathFileSqlite, sqlite3.OPEN_READONLY)
  db.serialize(function () {
    db.all(sql, params, function (err, rows) {
      if (err) {
        console.error(err, 'SQL: ' + sql, 'PARAMS: ' + JSON.stringify(params))
        return callback({ ok: false, message: err })
      }
      console.log('sqlSelect:', this, JSON.stringify(params))
      return callback({ ok: true, rows: rows })
    }).close()
  });
}

