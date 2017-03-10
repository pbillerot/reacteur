import validator from 'validator'
import md5 from 'js-md5'
import randomstring from 'randomstring'
import moment from 'moment'
const { Tools } = require('../../Tools')

module.exports = {
    title: 'REACTEUR Studio',
    desc: "Le framework de développement des applications REACTEUR",
    group: "ADMIN",
    tables: {
        acttokens: { // voir reacteur.sql
            basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
            key: 'tok_id',
            elements: {
                tok_id: {
                    label_long: "Token",
                    label_short: "Token",
                    type: "text",
                    default: (ctx) => { return randomstring.generate(23) },
                },
                tok_url: {
                    label_long: "Url",
                    label_short: "Url",
                    type: "text",
                    default: (ctx) => {
                        return ctx.session.host + "/api/toctoc/" + ctx.elements.tok_id.value
                    },
                },
                tok_redirect: {
                    label_long: "Redirect to",
                    label_short: "Redirect to",
                    type: "text"
                },
                _note_new_pwd: {
                    type: 'note',
                    note: "Vous recevrez un mail pour vous inviter à créer un nouveau mot de passe"
                },
                tok_pseudo: {
                    label_long: "Pseudo",
                    label_short: "Pseudo",
                    type: 'text',
                    server_select: "select user_pseudo from actusers where user_email = $tok_email"
                },
                tok_expired: {
                    label_long: "Expire le",
                    label_short: "Expire le",
                    type: 'text',
                    default: (ctx) => {
                        return moment().add(7, 'days').format()
                    }
                },
                tok_used: {
                    label_long: "Utilisé le",
                    label_short: "Utilisé le",
                    type: 'text',
                },
                tok_email: {
                    label_short: "Email",
                    label_long: "Votre email",
                    type: "mail",
                    group: '',
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && validator.isEmail(value)
                    },
                    error: "Adresse email non valide",
                    mail: (ctx) => { // voir https://github.com/nodemailer/nodemailer
                        return {
                            from: null, // sender address défini dans config
                            to: ctx.elements.tok_email.value, // list of receivers
                            subject: "J'ai perdu mon mot de passe", // Subject line
                            template: 'tok_email.ejs'
                        }
                    },
                }
            },
            views: {
                vall: {
                    title: 'Token...',
                    group: 'BIDON',
                    elements: {
                        tok_id: {},
                        tok_pseudo: {},
                        tok_email: {},
                        tok_url: {},
                        tok_redirect: {}
                    }
                }
            },
            forms: {
                forgetpwd: {
                    title: "J'ai perdu mon mot de passe",
                    action_title: 'Envoyer',
                    return_route: '/',
                    group: null,
                    owner: true,
                    elements: {
                        tok_id: { is_hidden: true },
                        tok_url: { is_hidden: true },
                        tok_redirect: { is_hidden: true },
                        tok_pseudo: { is_hidden: true },
                        tok_expired: { is_hidden: true },
                        _note_new_pwd: {},
                        tok_email: {}
                    },
                    is_valide(ctx) {
                        return true
                    },
                    compute(ctx) {
                        ctx.elements.tok_redirect.value = ctx.session.host
                            + "/form/edit/reacteur/actusers/vident/fchgpwd/"
                            + ctx.elements.tok_pseudo.value
                        //
                    },
                    server_check: [
                        "select 'Email inconnu' where not exists (select user_pseudo from actusers where user_email = $tok_email)",
                    ],
                    server_post_update: []
                }
            }
        },
        actusers: { // voir reacteur.sql
            basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
            key: 'user_pseudo',
            elements: {
                user_pseudo: {
                    label_long: "Pseudo",
                    label_short: "Pseudo",
                    type: "text",
                    maxlength: 20,
                    pattern: "[A-Z,a-z,0-9]*",
                    placeholder: "",
                    help: "",
                    is_valide(value, ctx) {
                        return value.length > 2 && validator.isAlphanumeric(value)
                    },
                    error: "Longueur minimum de 3 car. et n'accepte que les caractères alphanumériques"
                },
                user_email: {
                    label_long: "Email",
                    label_short: "Email",
                    type: "email",
                    maxlength: 70,
                    placeholder: "",
                    help: "",
                    is_valide(value, ctx) {
                        return !validator.isEmpty(value) && validator.isEmail(value)
                    },
                    error: "Adresse email non valide"
                },
                user_profil: {
                    label_long: "Profil",
                    label_short: "Profil",
                    title: "",
                    type: "radio",
                    maxlength: 15,
                    list: {
                        ADMIN: "ADMIN",
                        INVITE: "INVITE"
                    },
                    default: "INVITE",
                    is_valide(value, ctx) {
                        return true
                    },
                    error: ""
                },
                user_actif: {
                    label_long: "Actif",
                    label_short: "Actif",
                    title: "",
                    type: "check",
                    is_valide(value, ctx) {
                        return true
                    },
                    error: ""
                },
                user_pwd: {
                    label_long: "Mot de passe",
                    label_short: "",
                    type: "password",
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value, ctx) {
                        return value.length > 7
                    },
                    error: "Obligatoire",
                    server_record(value) {
                        return md5(value)
                    }
                },
                user_token: {
                    label_long: "Token",
                    label_short: "Token",
                    type: "text",
                    default: (ctx) => { return randomstring.generate(23) },
                },

                _user_pwd_1: {
                    label_long: "Créer un nouveau mot de passe",
                    label_short: "",
                    type: "password",
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value, ctx) {
                        return validator.isByteLength(value, { min: 8 })
                    },
                    error: "Obligatoire, d'une longueur minimum de 8 caractères, n'accepte que les caractères A-Z a-z 0-9 _-",
                },
                _user_pwd_2: {
                    label_long: "Confirmer ce mot de passe",
                    label_short: "",
                    type: "password",
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value, ctx) {
                        return value == ctx.elements._user_pwd_1.value ? true : false
                    },
                    error: "Les mots de passe ne sont pas identiques",
                },
                _link_new_compte: {
                    label_long: "Créer un nouveau compte...",
                    type: "link",
                    action_url: '/form/add/reacteur/actusers/vident/fnew/0'
                },
                _link_forget_pwd: {
                    label_long: "J'ai oublié mon mot de passe...",
                    title: "Un mail vous sera envoyé pour créer un nouveau mot de passe",
                    type: "link",
                    action_url: '/form/add/reacteur/acttokens/vall/forgetpwd/0'
                },
                _link_chg_pwd: {
                    label_long: "Changer mon mot de passe...",
                    type: "link",
                    action_url: '/form/edit/reacteur/actusers/vident/fchgpwd/:user_pseudo'
                },
                _link_chg_email: {
                    label_long: "Changer mon adresse email...",
                    type: "link",
                    action_url: '/form/edit/reacteur/actusers/vident/fchgemail/:user_pseudo'
                },
                _link_delete_account: {
                    label_long: "Supprimer mon compte...",
                    type: "link",
                    action_url: '/form/delete/reacteur/actusers/vident/fdelaccount/:user_pseudo'
                },
                _link_adm_compte: {
                    label_long: "Administrer les comptes...",
                    type: "link",
                    group: 'ADMIN',
                    action_url: '/view/reacteur/actusers/vall'
                },
                _btn_disconnect: {
                    label_long: "Se déconnecter...",
                    type: "button",
                    on_click: {
                        action: '/api/cnx/close',
                        method: 'PUT'
                    }
                }
            },
            views: {
                vall: {
                    title: 'Gestion des comptes...',
                    form_add: 'fall',
                    form_view: 'fall',
                    form_edit: 'fall',
                    form_delete: 'fall',
                    is_hidden: false,
                    group: 'ADMIN',
                    elements: {
                        user_pseudo: {},
                        user_actif: {},
                        user_email: {},
                        user_profil: {}
                    }
                },
                vident: {
                    title: 'Connexion...',
                    form_auto: 'fident',
                    form_auto_action: 'ident',
                    form_add: null,
                    form_view: null,
                    form_edit: null,
                    form_delete: null,
                    is_hidden: true,
                    group: null,
                    elements: {
                    }
                },
                vpwd: {
                    title: 'Connexion...',
                    form_auto: 'fident',
                    form_auto_action: 'ident',
                    form_add: null,
                    form_view: null,
                    form_edit: null,
                    form_delete: null,
                    is_hidden: true,
                    group: null,
                    elements: {
                    }
                }
            },
            forms: {
                fall: {
                    title: 'USER',
                    group: 'ADMIN',
                    elements: {
                        user_pseudo: {},
                        //user_pwd: {},
                        user_email: {},
                        user_profil: {},
                        user_actif: {}
                    },
                    is_valide(ctx) {
                        return true
                    },
                    error: "Formulaire non correct"
                },
                fnew: {
                    title: "Création d'un compte",
                    action_title: 'Créer',
                    return_route: '/',
                    group: null,
                    elements: {
                        user_pseudo: {},
                        user_email: {},
                        _user_pwd_1: {},
                        _user_pwd_2: {},
                        user_pwd: { is_hidden: true },
                        user_actif: { is_hidden: true },
                        user_profil: { is_hidden: true }
                    },
                    is_valide(ctx) {
                        return true
                    },
                    compute(ctx) {
                        ctx.elements.user_pwd.value = ctx.elements._user_pwd_1.value
                        ctx.elements.user_actif.value = '1'
                        ctx.elements.user_profil.value = 'INVITE'
                    },
                    server_check: [
                        "select 'Ce pseudo existe déjà' where exists (select user_pseudo from actusers where user_pseudo = $user_pseudo)",
                        "select 'Cet Email existe déjà' where exists (select user_email from actusers where user_email = $user_email)",
                    ]


                },
                fdelaccount: {
                    title: 'Supprimer mon compte',
                    owner: true,
                    return_route: '/',
                    group: null,
                    elements: {
                        user_pseudo: {},
                        user_email: {}
                    }
                },
                fident: {
                    title: 'CONNEXION',
                    action_title: 'Valider',
                    group: null,
                    elements: {
                        user_pseudo: {},
                        user_pwd: {},
                        _link_new_compte: {},
                        _link_forget_pwd: {}
                    },
                },
                fchgemail: {
                    title: "Changer mon adresse email",
                    action_title: 'Valider',
                    return_route: '/',
                    group: '',
                    owner: true,
                    elements: {
                        user_pseudo: { is_read_only: true },
                        user_email: {},
                    },
                    server_check: [
                        "select 'Cet email existe déjà' \
                        where exists (select user_pseudo from actusers \
                        where user_pseudo <> $user_pseudo and user_email = $user_email)"
                    ]

                },
                fchgpwd: {
                    title: "Changer mon mot de passe",
                    action_title: 'Valider',
                    return_route: '/',
                    group: null,
                    owner: true,
                    elements: {
                        user_pseudo: { is_read_only: true },
                        user_email: { is_read_only: true },
                        _user_pwd_1: {},
                        _user_pwd_2: {},
                        user_pwd: { is_hidden: true }
                    },
                    compute(ctx) {
                        ctx.elements.user_pwd.value = ctx.elements._user_pwd_1.value
                    }
                },
                fmenuident: {
                    title: "Mon compte",
                    action_title: null,
                    return_route: '/',
                    group: null,
                    owner: true,
                    elements: {
                        user_pseudo: { is_read_only: true },
                        user_email: { is_read_only: true },
                        _link_chg_pwd: {},
                        _link_chg_email: {},
                        _link_delete_account: {},
                        _btn_disconnect: {}
                    }
                }
            }
        },
    }
}