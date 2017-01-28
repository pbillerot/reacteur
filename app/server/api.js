const express = require('express');
const router = express.Router();
const async = require('async')
const fs = require('fs')

const { Dico, ctx } = require('../config/Dico')
const { Tools } = require('../config/Tools')
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
 * Appel de l'aide
 */
router.get('/help/:app', function (req, res) {
  var session = req.session
  let path = __dirname + '/../config/' + req.params.app + '.md';
  let file = fs.readFileSync(path, 'utf8');
  res.send((file.toString()));
})

/**
 * Mise à jour d'un enregistreemnt
 */
router.post('/:app/:table/:view/:form/:id', function (req, res) {
  //console.log(req.url)
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.formulaire = Dico.tables[req.params.table].forms[req.params.form]
      ctx.rubs = Dico.tables[req.params.table].rubs
      ctx.fields = Dico.tables[req.params.table].forms[req.params.form].fields
      ctx.key_name = Dico.tables[req.params.table].key
      ctx.id = req.params.id
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_form,
    Reacteur.api_load_fields,
    Reacteur.api_compute_fields,
    Reacteur.api_compute_form,
    Reacteur.api_check_fields,
    Reacteur.api_check_form,
    Reacteur.api_update_record,
    Reacteur.api_post_update_fields,
    Reacteur.api_post_update_form,
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
router.put('/:app/:table/:view/:form', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.formulaire = Dico.tables[req.params.table].forms[req.params.form]
      ctx.rubs = Dico.tables[req.params.table].rubs
      ctx.fields = Dico.tables[req.params.table].forms[req.params.form].fields
      ctx.key_name = Dico.tables[req.params.table].key
      ctx.id = req.params.id
      callback(null, ctx)
    },
    Reacteur.api_check_session_forgetpwd,
    Reacteur.api_check_group_form,
    Reacteur.api_load_fields,
    Reacteur.api_compute_fields,
    Reacteur.api_compute_form,
    Reacteur.api_check_fields,
    Reacteur.api_check_form,
    Reacteur.api_insert_record,
    Reacteur.api_post_update_fields,
    Reacteur.api_post_update_form,
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
router.delete('/:app/:table/:view/:form/:id', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.formulaire = Dico.tables[req.params.table].forms[req.params.form]
      ctx.rubs = Dico.tables[req.params.table].rubs
      ctx.fields = Dico.tables[req.params.table].forms[req.params.form].fields
      ctx.key_name = Dico.tables[req.params.table].key
      ctx.id = req.params.id
      callback(null, ctx)
    },
    Reacteur.api_check_session,
    Reacteur.api_check_group_form,
    Reacteur.api_delete_record,
    Reacteur.api_post_update_form,
    function (ctx, callback) {
      console.log('END')
      if (req.params.table == 'actusers' && req.params.form == 'fdelaccount') {
        req.session.destroy(function (err) {
          // will have a new session here
          if (err)
            console.log('ERROR', err)
        })
      }
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
router.get('/form/:app/:table/:view/:form/:id', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.formulaire = Dico.tables[req.params.table].forms[req.params.form]
      ctx.rubs = Dico.tables[req.params.table].rubs
      ctx.fields = Dico.tables[req.params.table].forms[req.params.form].fields
      ctx.key_name = Dico.tables[req.params.table].key
      ctx.id = req.params.id
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
router.get('/view/:app/:table/:view', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.vue = Dico.tables[req.params.table].views[req.params.view]
      ctx.cols = Dico.tables[req.params.table].views[req.params.view].cols
      ctx.rubs = Dico.tables[req.params.table].rubs
      ctx.tableur = []
      ctx.key_name = Dico.tables[req.params.table].key
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
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
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
 * Ouverture d'une session en fonction du token lu dans acttokens
 * et redirection sur l'url trouvée
 */
router.get('/toctoc/:token', function (req, res) {
  console.log(req.url)
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      callback(null, ctx)
    },
    Reacteur.api_token,
    function (ctx, callback) {
      console.log('END')
      res.status(200).redirect(ctx.session.redirect)
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )

})

router.get('/select/:app/:table/:rub/:input', function (req, res) {
  async.waterfall([
    function (callback) {
      console.log('INIT_CTX...')
      ctx.req = req
      ctx.res = res
      ctx.session = req.session
      ctx.app = req.params.app
      ctx.table = req.params.table
      ctx.rub = req.params.rub
      ctx.input = req.params.input
      ctx.result = [{value: '1', label: '1111'},{value: '2', label: '2222'}]
      callback(null, ctx)
    },
    Reacteur.api_select,
    function (ctx, callback) {
      console.log('END')
      res.status(200).send(ctx.result)
    }
  ],
    function (err, result) {
      console.log(err, result)
      res.status(err).json(result) // KO
    }
  )

})

module.exports = router;

