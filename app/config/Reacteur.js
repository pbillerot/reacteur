/**
 * Déclaration du dictionnaire des rubriques,fieldsulaires et vues de l'application
 * 
 */
// https://www.npmjs.com/package/validator
const validator = require('validator')
const sqlite3 = require('sqlite3').verbose()
const md5 = require('js-md5')
const fs = require('fs')
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const moment = require('moment')
const ejs = require('ejs')
const sprintf = require('sprintf-js').sprintf

const { Dico, Tools } = require('./Dico')

/**
 * Reacteur: 
 * Configuration et fonctions sur le serveur
 * 
 */

const Reacteur = {
    config: {
        smtpConfig: {
            host: 'smtp.free.fr'
        },
        from: '"Reacteur" <philippe.billerot@gmail.com>',
        ssl: {
            key: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/privkey.pem'),
            cert: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/cert.pem'),
            ca: fs.readFileSync('/home/billerot/conf/letsencrypt/live/pbillerot.freeboxos.fr/chain.pem'),
        }

    },
    /**
     * Messages retour du serveur
     */
    message: (code, ...params) => {
        return { code: code, message: sprintf(Reacteur.messages['m' + code], params) }
    },
    messages: {
        m2002: "Le mot de passe a été enregistré",
        m2003: "Mot de passe correct",
        m2004: "Suppression réalisée avec succès",
        m2005: "Mise à jour réalisée avec succès",
        m2006: "Création réalisée avec succès",
        m2007: "La connexion a été fermée",
        m2008: "Aucune mise à jour à réalisée",
        m2009: "postUpdate OK",
        m2010: "ctrl OK",

        m4001: "La référence existe déjà",
        m4002: "Mot de passe erroné",
        m4004: "Compte pseudo inconnu",
        m4005: "Email inconnu",
        m4006: "",
        m4009: "postUpdate K0",
        m4010: "ctrl K0",

        m5001: "Erreur DATABASE sur le serveur",
        m5001: "Erreur %s non trouvée",

        m9901: "Accès refusé, session non ouverte",
        m9902: "Accès refusé à la vue",
        m9903: "Accès refusé au formulaire",
        m9904: "Accès refusé à la rubrique",
        m9905: "Accès refusé, jeton non reconnu",
        m9906: "Accès refusé, pseudo non reconnu",
        m9907: "Accès refusé, Vous n'êtes pas le propriétaire de cette ressource",
        m9908: "Accès refusé, le jeton est expiré"
    },
    /**
     * server_check
     */
    server_check: (ctx, callback) => {
        let basename = Dico.tables[ctx.table].basename
        let params = {}
        Object.keys(ctx.fields).forEach(key => {
            params['$' + key] = ctx.fields[key].value
        })
        if (ctx.formulaire.server_check) {
            let countMax = ctx.formulaire.server_check.length
            let count = 0
            let isCallback = false
            ctx.formulaire.server_check.forEach(sql => {
                let db = new sqlite3.Database(Dico.tables[ctx.table].basename, sqlite3.OPEN_READONLY)
                // suppression des paramètres non trouvés dans la commande sql
                let args = {}
                Object.keys(params).forEach(key => {
                    if (sql.indexOf(key) >= 0) {
                        args[key] = params[key]
                    }
                })
                db.all(sql, args, (err, rows) => {
                    count++
                    if (err) {
                        if (!isCallback) {
                            callback(500, Reacteur.message(5001))
                            isCallback = true
                        }
                    } else {
                        // On récupère la 1ère cellule
                        let value = ''
                        rows.forEach((row) => {
                            Object.keys(row).forEach(key => {
                                value = row[key]
                                return
                            })
                        })
                        if (value.length > 0) {
                            if (!isCallback) {
                                callback(400, { code: 4010, message: value });
                                isCallback = true
                            }
                        } else {
                            if (count >= countMax) {
                                if (!isCallback) {
                                    callback(null)
                                    isCallback = true
                                }
                            }
                        }
                    }
                }).close()
            }) // end forEach
        } else {
            callback(null)
        }
    },
    /**
     * server_post_update
     */
    server_post_update_fields: (ctx, callback) => {
        // post_update des champs
        let error = null
        let resultat = null
        Object.keys(ctx.fields).forEach(field => {
            //console.log(field)
            if (error) return
            switch (ctx.rubs[field].type) {
                case 'mail':
                    Reacteur.sendMail(field, ctx.rubs, ctx, (err, result) => {
                        error = err
                        resultat = result
                    })
                    break
                default:
                    break
            }
        })
        if (error) {
            return callback(error, resultat);
        } else {
            return callback(null, Reacteur.message(2009));
        }
    },
    server_post_update: (ctx, callback) => {
        // poste_update du formulaire
        let basename = Dico.tables[ctx.table].basename
        let params = {}
        Object.keys(ctx.fields).forEach(key => {
            params['$' + key] = ctx.fields[key].value
        })
        if (ctx.formulaire.server_post_update) {
            let countMax = ctx.formulaire.server_post_update.length
            let count = 0
            let isCallback = false

            ctx.formulaire.server_post_update.forEach(sql => {
                Reacteur.sql_update(basename, sql, params, (err, result) => {
                    count++
                    if (!isCallback) {
                        if (err) {
                            isCallback = true
                            callback(500, Reacteur.message(5001))
                        } else {
                            if (count >= countMax) {
                                isCallback = true
                                callback(null)
                            }
                        }
                    }
                })

            })
        }
        return callback(null, Reacteur.message(2009));
    },
    /**
     * Envoi de mails
     * https://github.com/nodemailer/nodemailer
     */
    sendMail(key, rubs, ctx, callback) {
        //console.log('sendMail', key, rubs, Data.fields)
        let transport = nodemailer.createTransport(Reacteur.config.smtpConfig)
        let mail = rubs[key].mail()

        if (!mail.from)
            mail.from = Reacteur.config.from

        let fileMail = mail.template
        let data = {}
        Object.keys(ctx.fields).forEach(key => {
            data[key] = ctx.fields[key].value
        })
        let md = ejs.renderFile(__dirname + '/../config/' + fileMail, data, {}, function (err, str) {
            console.log('ejs', err, str)
            if (err) {
                return callback(Reacteur.message(5001))
            }
            mail.html = str
            transport.sendMail(mail).then(function (info) {
                console.log(info);
                return callback(null, { code: 2009, message: info.response })
            }).catch(function (err) {
                console.log(err);
                return callback(500, { code: 5001, message: err.response })
            });

        });
    },
    /**
    * CRUD
    */
    sqlUpdate(pathFileSqlite, sql, params, callback) {
        let db = new sqlite3.Database(pathFileSqlite)
        // suppression des paramètres non trouvés dans la commande sql
        params.forEach(key => {
            if (sql.indexOf(key) == -1) {
                delete params[key]
            }
        })
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
    },
    sqlSelect(pathFileSqlite, sql, params, callback) {
        let db = new sqlite3.Database(pathFileSqlite, sqlite3.OPEN_READONLY)
        // suppression des paramètres non trouvés dans la commande sql
        params.forEach(key => {
            if (sql.indexOf(key) == -1) {
                delete params[key]
            }
        })
        db.serialize(function () {
            db.all(sql, params, function (err, rows) {
                if (err) {
                    console.error(err, 'SQL: ' + sql, 'PARAMS: ' + JSON.stringify(params))
                    return callback({ ok: false, message: err })
                }
                console.log('sqlSelect:', this, JSON.stringify(params))
                // On récupère la 1ère cellule
                let value = ''
                rows.forEach((row) => {
                    Object.keys(row).forEach(key => {
                        value = row[key]
                        return
                    })
                })
                return callback({ ok: true, rows: rows, value: value })
            }).close()
        });
    },
    sql_update(pathFileSqlite, sql, params, callback) {
        let db = new sqlite3.Database(pathFileSqlite)
        // suppression des paramètres non trouvés dans la commande sql
        let args = {}
        Object.keys(params).forEach(key => {
            if (sql.indexOf(key) >= 0) {
                args[key] = params[key]
            }
        })
        db.serialize(function () {
            db.run(sql, args, function (err) {
                if (err) {
                    console.error(err, 'SQL: ' + sql, 'PARAMS: ' + JSON.stringify(args))
                    return callback(500, Reacteur.message(5001))
                } else {
                    //console.log('sql_update:', this, JSON.stringify(args))
                    return callback(null, { lastID: this.lastID, changes: this.changes })
                }
            }).close()
        });
    },
    sql_select(pathFileSqlite, sql, params, callback) {
        let db = new sqlite3.Database(pathFileSqlite, sqlite3.OPEN_READONLY)
        // suppression des paramètres non trouvés dans la commande sql
        let args = {}
        Object.keys(params).forEach(key => {
            if (sql.indexOf(key) >= 0) {
                args[key] = params[key]
            }
        })
        db.serialize(() => {
            //console.log('sql_select', args, sql)
            db.all(sql, args, (err, rows) => {
                //console.log('<<<', err, rows)
                if (err) {
                    console.log('sql_select', err, sql, args)
                    callback(500, Reacteur.message(5001))
                } else {
                    // On récupère la 1ère cellule
                    let value = ''
                    rows.forEach((row) => {
                        Object.keys(row).forEach(key => {
                            //console.log('row', row)
                            value = row[key]
                            return
                        })
                    })
                    //console.log('sql_select_result:', rows, value)
                    callback(null, { rows: rows, value: value })
                }
            }).close()
            //console.log('end sql_select')

        });
    },
    api_check_session: (ctx, callback) => {
        console.log('CHECK_SESSION...')
        // Ctrl session
        if (!ctx.session || !ctx.session.user_pseudo || ctx.session.user_pseudo.length < 3) {
            callback(400, Reacteur.message(9901))
        } else {
            callback(null, ctx)
        }
    },
    api_check_session_forgetpwd: (ctx, callback) => {
        console.log('CHECK_SESSION...')
        // Ctrl session
        if (!ctx.session || !ctx.session.user_pseudo || ctx.session.user_pseudo.length < 3) {
            if (ctx.req.params.form != 'forgetpwd' && ctx.req.params.form != 'fnew' && ctx.table != 'actusers') {
                ctx.res.status(400).json(Reacteur.message(9901))
            } else {
                callback(null, ctx)
            }
        } else {
            callback(null, ctx)
        }
    },
    api_update_record: (ctx, callback) => {
        console.log('UPDATE_RECORD...')
        // Transformation des values en record
        Object.keys(ctx.fields).forEach((key) => {
            if (!Tools.isRubTemporary(key) && ctx.fields[key].is_read_only == false) {
                ctx.fields[key].record_value = ctx.fields[key].value // par défaut record_value = value
                if (ctx.rubs[key].srv_record)
                    ctx.fields[key].record_value = ctx.rubs[key].srv_record(ctx.fields[key].value)
            }
        })

        // construction de l'ordre sql et des paramètres
        let sql = ""
        let params = {}
        Object.keys(ctx.fields).forEach((key) => {
            if (!Tools.isRubTemporary(key) && ctx.fields[key].is_read_only == false) {
                sql += sql.length > 0 ? ", " : ""
                sql += key + " = $" + key
                params['$' + key] = ctx.fields[key].record_value
            }
        })

        // Mise à jour de la base
        if (sql.length > 2) {
            sql = 'UPDATE ' + ctx.table + ' SET ' + sql
            sql += " WHERE " + ctx.key_name + " = $" + ctx.key_name
            params['$' + ctx.key_name] = ctx.id
            Reacteur.sql_update(Dico.tables[ctx.table].basename, sql, params, (err, result) => {
                if (err) {
                    callback(err, result)
                } else {
                    callback(null, ctx)
                }
            })
        } else {
            callback(null, ctx)
        }
    },
    api_insert_record: (ctx, callback) => {
        console.log('INSERT_RECORD...')
        // Transformation des values en record
        Object.keys(ctx.fields).forEach((key) => {
            if (!Tools.isRubTemporary(key) && ctx.fields[key].is_read_only == false) {
                ctx.fields[key].record_value = ctx.fields[key].value // par défaut record_value = value
                if (ctx.rubs[key].srv_record)
                    ctx.fields[key].record_value = ctx.rubs[key].srv_record(ctx.fields[key].value)
            }
        })

        let params = {}
        let sql = '('
        let bstart = true;
        Object.keys(ctx.fields).forEach((key) => {
            if (!Tools.isRubTemporary(key) && ctx.fields[key].is_read_only == false) {
                sql += !bstart ? ", " : ""
                sql += key
                bstart = false;
            }
        })

        // si pas de champ de la table en maj on arrête
        if (sql.length > 2) {
            sql += ') VALUES ('
            bstart = true;
            Object.keys(ctx.fields).forEach((key) => {
                if (!Tools.isRubTemporary(key) && ctx.fields[key].is_read_only == false) {
                    sql += !bstart ? ", " : ""
                    sql += "$" + key
                    bstart = false;
                    params['$' + key] = ctx.fields[key].record_value
                }
            })
            sql += ')'
            sql = 'INSERT INTO ' + ctx.table + ' ' + sql
            Reacteur.sql_update(Dico.tables[ctx.table].basename, sql, params, (err, result) => {
                if (err) {
                    callback(err, result)
                } else {
                    callback(null, ctx)
                }
            })
        } else {
            callback(null, ctx)
        }
    },
    api_delete_record: (ctx, callback) => {
        console.log('DELETE_RECORD...')
        // construction de l'ordre sql et des paramètres
        let sql = 'DELETE FROM ' + ctx.table
            + " WHERE " + ctx.key_name + " = $" + ctx.key_name
        let params = {}
        params['$' + ctx.key_name] = ctx.id

        Reacteur.sql_update(Dico.tables[ctx.table].basename, sql, params, (err, result) => {
            if (err) {
                callback(err, result)
            } else {
                callback(null, ctx)
            }
        })
    },
    api_read_record: (ctx, callback) => {
        console.log('READ_RECORD...')
        // construction de l'ordre sql et des paramètres
        let params = {}
        let sql = ''
        Object.keys(ctx.fields).forEach((key) => {
            if (!Tools.isRubTemporary(key)) {
                sql += sql.length > 0 ? ', ' + ctx.table + "." + key : ctx.table + "." + key
            }
            ctx.fields[key].value = ''
        })
        if (sql.length > 0) {
            sql = 'SELECT ' + sql + ' FROM ' + ctx.table
            sql += " WHERE " + ctx.key_name + " = $" + ctx.key_name
            params['$' + ctx.key_name] = ctx.id
            Reacteur.sql_select(Dico.tables[ctx.table].basename, sql, params, (err, result) => {
                if (err) {
                    callback(err, result)
                } else {
                    if (result.rows.length > 0) {
                        Object.keys(ctx.fields).map(key => {
                            if (!Tools.isRubTemporary(key)) {
                                ctx.fields[key].value = result.rows[0][key]
                            }
                        })
                    }
                    callback(null, ctx)
                }
            })
        } else {
            // record not found
            callback(null, ctx)
        }
    },
    api_read_view: (ctx, callback) => {
        console.log('READ_VIEW...')
        // construction de l'ordre sql et des paramètres
        let params = {}
        let sql = ''
        Object.keys(ctx.cols).forEach((key) => {
            if (!Tools.isRubTemporary(key))
                sql += sql.length > 0 ? ', ' + ctx.table + "." + key : ctx.table + "." + key
        })
        if (sql.length > 0) {
            sql = 'SELECT ' + sql + ' FROM ' + ctx.table
            params['$' + ctx.key_name] = ctx.id
            Reacteur.sql_select(Dico.tables[ctx.table].basename, sql, params, (err, result) => {
                if (err) {
                    callback(err, result)
                } else {
                    result.rows.forEach((row) => {
                        // insertion des colonnes des rubriques temporaires
                        let ligne = {}
                        let key_value = ''
                        Object.keys(ctx.cols).forEach(key => {
                            if (key == ctx.key_name) {
                                key_value = row[key]
                            }
                            if (Tools.isRubTemporary(key)) {
                                ligne[key] = key_value
                            } else {
                                ligne[key] = row[key]
                            }
                        })
                        ctx.tableur.push(ligne)
                    })
                    callback(null, ctx)
                }
            })
        } else {
            // record not found
            callback(null, ctx)
        }
    },
    api_connect: (ctx, callback) => {
        let user_pseudo = ctx.req.body['user_pseudo']
        let user_pwd = ctx.req.body['user_pwd']

        let sql = "select user_email, user_profil, user_pwd from ACTUSERS where user_pseudo = $user_pseudo"
        let params = { $user_pseudo: user_pseudo }
        let basename = Dico.tables['actusers'].basename

        Reacteur.sql_select(Dico.tables['actusers'].basename, sql, params, (err, result) => {
            if (err) {
                callback(err, result)
            } else {
                // OK
                let pwdmd5 = ''
                let user_email = ''
                let user_profil = ''
                if (result.rows.length > 0) {
                    result.rows.forEach((row) => {
                        pwdmd5 = row.user_pwd
                        if ( pwdmd5.length == 0 ) {
                            // 1ére connexion on accepte le nouveau password
                            pwdmd5 = md5(user_pwd)
                        }
                        user_email = row.user_email
                        user_profil = row.user_profil
                    })
                    if (md5(user_pwd) != pwdmd5) {
                        callback(400, Reacteur.message(4002))
                    } else {
                        // User OK
                        ctx.session.user_pseudo = user_pseudo
                        ctx.session.user_email = user_email
                        ctx.session.user_profil = user_profil
                        callback(200, Reacteur.message(2003))
                    }
                } else {
                    callback(400, Reacteur.message(4004))
                }
            }
        })
    },
    api_token: (ctx, callback) => {
        let tok_id = ctx.req.params.token

        let sql = "select * from ACTTOKENS where tok_id = $tok_id"
        let params = { $tok_id: tok_id }
        let basename = Dico.tables['acttokens'].basename
        Reacteur.sql_select(basename, sql, params, (err, result) => {
            if (err) {
                callback(err, result)
            } else {
                if (result.rows.length > 0) { // le token est trouvé
                    let token = result.rows[0]
                    // ctrl expiration du token
                    if (moment(token.tok_expired).isAfter(moment())) {
                        // le jeton n'est pas expiré

                        // recherche dans actusers
                        let sql = "select * from ACTUSERS where user_pseudo = $user_pseudo"
                        let params = { $user_pseudo: token.tok_pseudo }
                        let basename = Dico.tables['actusers'].basename
                        Reacteur.sql_select(basename, sql, params, (err, result) => {
                            if (err) {
                                callback(err, result)
                            } else {
                                if (result.rows.length > 0) { // le pseudo est trouvé
                                    let user = result.rows[0]
                                    // Initialisation de la session
                                    ctx.session.user_pseudo = user.user_pseudo
                                    ctx.session.user_email = user.user_email
                                    ctx.session.user_profil = user.user_profil
                                    // redirection sur l'URL liée au token
                                    ctx.session.redirect = token.tok_redirect
                                    callback(null, ctx)
                                } else {
                                    // le pseudo n'existe plus
                                    console.log(token.tok_pseudo, token.tok_email, Reacteur.message(9906))
                                    callback(400, Reacteur.message(9906))
                                }
                            }
                        })
                    } else {
                        // le jeton est expiré
                        console.log(Reacteur.message(9908))
                        callback(400, Reacteur.message(9908))
                    }
                } else {
                    console.log(Reacteur.message(9905))
                    callback(400, Reacteur.message(9905))
                }
            }
        })
    },
    api_check_group_form: (ctx, callback) => {
        console.log('CHECK_GROUP_FORM...')
        // Ctrl accès au formulaire
        let bret = true
        if (ctx.formulaire.group) {
            let groups = ctx.session.user_profil.split(',')
            let ok = false
            groups.forEach(group => {
                if (group == ctx.formulaire.group)
                    ok = true
            })
            if (!ok) {
                bret = false
                callback(400, Reacteur.message(9903))
            }
        }
        if (bret) {
            // Ctrl owner
            if (ctx.formulaire.owner) {
                if (ctx.req.params.id != ctx.session.user_pseudo) {
                    bret = false
                    callback(400, Reacteur.message(9907))
                }
            }
        }
        if (bret) {
            callback(null, ctx)
        }
    },
    api_check_group_view: (ctx, callback) => {
        console.log('CHECK_GROUP_VIEW...')
        // Ctrl accès à la vue
        let bret = true
        if (ctx.vue.group) {
            let groups = ctx.session.user_profil.split(',')
            let ok = false
            groups.forEach(group => {
                if (group == ctx.vue.group)
                    ok = true
            })
            if (!ok) {
                bret = false
                callback(400, Reacteur.message(9902))
            }
        }
        if (bret) {
            callback(null, ctx)
        }
    },
    api_load_fields: (ctx, callback) => {
        console.log('LOAD_FIELDS...')
        // Recup des valeurs transmises
        let post_data = ctx.req.body
        Object.keys(ctx.fields).forEach((key) => {
            ctx.fields[key].value = ''
            if (post_data[key]) {
                ctx.fields[key].value = post_data[key]
            }
            if (!ctx.fields[key].is_read_only) {
                ctx.fields[key].is_read_only = false
            }
        })
        callback(null, ctx)
    },
    api_compute_fields: (ctx, callback) => {
        console.log('COMPUTE_FIELDS...')
        // calcul des champs sql
        let countMax = 0
        let params = {}
        Object.keys(ctx.fields).forEach((key) => {
            if (ctx.rubs[key].server_compute && ctx.rubs[key].server_compute.length > 0) {
                countMax++
            }
            params['$' + key] = ctx.fields[key].value
        })
        let count = 0
        let isCallback = false
        let basename = Dico.tables[ctx.table].basename
        if (countMax > 0) {
            Object.keys(ctx.fields).forEach((key) => {
                if (ctx.rubs[key].server_compute && ctx.rubs[key].server_compute.length > 0) {
                    Reacteur.sql_select(basename, ctx.rubs[key].server_compute, params, (err, result) => {
                        count++
                        if (err) {
                            if (!isCallback) {
                                isCallback = true
                                callback(500, Reacteur.message(5001))
                            }
                        } else {
                            ctx.fields[key].value = result.value
                            console.log('set', key, result.value)
                            if (!isCallback) {
                                if (count >= countMax) {
                                    isCallback = true
                                    callback(null, ctx)
                                }
                            }
                        }
                    })
                }
            })
        } else {
            callback(null, ctx)
        }
    },
    api_compute_form: (ctx, callback) => {
        console.log('COMPUTE_FORM...')
        // calcul du formulaire
        if (ctx.formulaire.compute) {
            ctx.formulaire.compute()
        }
        callback(null, ctx)
    },
    api_check_fields: (ctx, callback) => {
        console.log('CHECK_FIELDS...')

        // Ctrl intrinséque des champs
        let bret = true
        let errors = []
        Object.keys(ctx.fields).forEach((key) => {
            if (ctx.rubs[key].is_valide) {
                if (!ctx.rubs[key].is_valide(ctx.fields[key].value)) {
                    bret = false
                    errors.push(ctx.rubs[key].error)
                }
            }
        })
        if (!bret) {
            let result = Reacteur.message(4005)
            result.message = errors.join()
            callback(400, result)
        } else {
            callback(null, ctx)
        }
    },
    api_check_form: (ctx, callback) => {
        console.log('CHECK_FORM...')
        // Controle sur le serveur
        if (ctx.formulaire.server_check) {
            Reacteur.server_check(ctx, (err, result) => {
                if (err) {
                    callback(err, result)
                } else {
                    callback(null, ctx)
                }
            })
        } else {
            callback(null, ctx)
        }
    },
    api_post_update_fields: (ctx, callback) => {
        console.log('POST_UPDATE_FIELDS...')
        // Mise à jour post des champs
        Reacteur.server_post_update_fields(ctx, (err, result) => {
            if (err) {
                callback(err, result)
            } else {
                callback(null, ctx)
            }
        })
    },
    api_post_update_form: (ctx, callback) => {
        // Mise à jour post du formulaire
        console.log('POST_UPDATE...')
        Reacteur.server_post_update(ctx, (err, result) => {
            if (err) {
                callback(err, result)
            } else {
                callback(null, ctx)
            }
        })
    }

}
export { Reacteur }
