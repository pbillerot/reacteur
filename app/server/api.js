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
const randomstring = require('randomstring')
const moment = require('moment')
const ejs = require('ejs')
const async = require('async')

const { Dico, Tools } = require('../config/Dico')
const { Reacteur } = require('../config/Reacteur')

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
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session,
        table: req.params.table,
        formulaire: Dico.tables[req.params.table].forms[req.params.form],
        rubs: Dico.tables[req.params.table].rubs,
        fields: Dico.tables[req.params.table].forms[req.params.form].fields,
        key_name: Dico.tables[req.params.table].key,
        id: req.params.id
      }
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_form,
    Reacteur.api_check_fields,
    Reacteur.api_check_form,
    Reacteur.api_update_record,
    Reacteur.api_post_update_fields,
    Reacteur.api_post_update,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(Reacteur.message(2005))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
})


/**
 * Création d'un enregistreement
 */
router.put('/:table/:view/:form', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session,
        table: req.params.table,
        formulaire: Dico.tables[req.params.table].forms[req.params.form],
        rubs: Dico.tables[req.params.table].rubs,
        fields: Dico.tables[req.params.table].forms[req.params.form].fields,
        key_name: Dico.tables[req.params.table].key,
        id: req.params.id
      }
      callback(null, ctx)
    },
    Reacteur.api_check_session_forgetpwd,
    Reacteur.api_check_group_form,
    Reacteur.api_check_fields,
    Reacteur.api_check_form,
    Reacteur.api_insert_record,
    Reacteur.api_post_update_fields,
    Reacteur.api_post_update,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(Reacteur.message(2006))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
})

/**
 * Suppression d'un enregistrement
 */
router.delete('/:table/:view/:form/:id', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session,
        table: req.params.table,
        formulaire: Dico.tables[req.params.table].forms[req.params.form],
        rubs: Dico.tables[req.params.table].rubs,
        fields: Dico.tables[req.params.table].forms[req.params.form].fields,
        key_name: Dico.tables[req.params.table].key,
        id: req.params.id
      }
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_form,
    Reacteur.api_delete_record,
    Reacteur.api_post_update,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(Reacteur.message(2006))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
})

/**
 * Lecture d'un enregistrement
 */
router.get('/form/:table/:view/:form/:id', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session,
        table: req.params.table,
        formulaire: Dico.tables[req.params.table].forms[req.params.form],
        rubs: Dico.tables[req.params.table].rubs,
        fields: Dico.tables[req.params.table].forms[req.params.form].fields,
        key_name: Dico.tables[req.params.table].key,
        id: req.params.id
      }
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_form,
    Reacteur.api_read_record,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(JSON.stringify(ctx.fields))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
})

/**
 * Lecture d'une vue
 */
router.get('/view/:table/:view', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session,
        table: req.params.table,
        vue: Dico.tables[req.params.table].views[req.params.view],
        cols: Dico.tables[req.params.table].views[req.params.view].cols,
        rubs: Dico.tables[req.params.table].rubs,
        tableur: [],
        key_name: Dico.tables[req.params.table].key
      }
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_view,
    Reacteur.api_read_view,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(JSON.stringify(ctx.tableur))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
})

/**
 * Connexion Authentification
 */
router.put('/cnx/ident', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      let ctx = {
        req: req,
        res: res,
        session: req.session
      }
      callback(null, ctx)
    },
    Reacteur.api_connect,
    function (ctx, callback) {
      console.log('END')
      res.status(200).json(Reacteur.message(2003))
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )
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
  res.status(200).json(Reacteur.message(2007))
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
  res.status(200).json({ host: req.protocol + '://' + req.get('host') })
})

module.exports = router;

