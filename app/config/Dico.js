/**
 * Déclaration du dictionnaire des rubriques,elementsulaires et vues de l'application
 * 
 */
// https://www.npmjs.com/package/validator
import validator from 'validator'
import md5 from 'js-md5'
import randomstring from 'randomstring'
import moment from 'moment'
const { Tools } = require('./Tools')
/**
 * Le dictionnaire de l'application
 * -> les tables sql (sqlite aujourd'hui)
 * -> les vues (tableur des données)
 * -> les formulaires pour consulter, mettre à jour, supprimer un enregitreement
 * -> les rubriques (les colonnes des vues, les champs des formulaires) qui seront manipulées par l'application
 *      Possibilité de définir des rubriques de travail qui ne seront pas dans le tables
 *      Dans ce cas le nom des rubriques sera préfixé par un _ (undescore)
 */
const Dico = {
    application: {
        title: 'REACTEUR',
        desc: "REACTEUR - Le Portail",
        url: 'https://github.com/pbillerot/reacteur',
        copyright: 'build with REACTEUR 2016 - version 1.2.16',
    },
    apps: {
        tarot: {
            title: 'TAROT',
            desc: "TAROT - Compter les points au tarot de 3 à 5 joueurs",
            group: "INVITE",
            tables: {
            }
        },
        reacteur: {
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
                            default: () => { return randomstring.generate(23) },
                        },
                        tok_url: {
                            label_long: "Url",
                            label_short: "Url",
                            type: "text",
                            default: () => { return ctx.session.host + "/api/toctoc/" + ctx.elements.tok_id.value },
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
                            default: () => {
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
                            default: () => { return randomstring.generate(23) },
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
        },
        ceou: {
            title: 'CEOU',
            desc: "CEOU - Enquêtes de disponibilité des invités pour organiser un événement",
            image: "http://www.w3schools.com/w3css/img_avatar3.png",
            tables: {
                ceou_groupes: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'groupe_id',
                    elements: {
                        groupe_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        groupe_nom: {
                            label_long: "Nom du groupe",
                            label_short: "Groupe",
                            type: "text",
                        },
                        groupe_info: {
                            label_long: "Désignation du groupe",
                            label_short: "Désignation du groupe",
                            type: "textarea",
                        },
                    },
                    views: {
                        vall: {
                            title: 'Groupes',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            elements: {
                                groupe_id: { is_hidden: true },
                                groupe_nom: {},
                                groupe_info: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "Groupes",
                            group: 'ADMIN',
                            elements: {
                                groupe_id: { is_protect: true },
                                groupe_nom: {},
                                groupe_info: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
                ceou_users: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'user_id',
                    elements: {
                        user_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        user_pseudo: {
                            label_long: "Pseudo",
                            label_short: "Pseudo",
                            type: "text",
                        },
                        user_email: {
                            label_long: "Email",
                            label_short: "Email",
                            type: "email",
                        },
                        user_profil: {
                            label_long: "Profil",
                            label_short: "Profil",
                            type: "radio",
                            list: {
                                ADMIN: "ADMIN",
                                PARTICIPANT: "PARTICIPANT"
                            },
                            default: "PARTICIPANT",

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
                        user_info: {
                            label_long: "Commentaires",
                            label_short: "Commentaires",
                            type: "textarea",
                        },
                        user_groupe_id: {
                            label_long: "Groupe",
                            label_short: "Groupe",
                            jointure: {
                                table: "ceou_groupes",
                                value: "groupe_id",
                                label: "groupe_nom"
                            },
                            type: "jointure_select",
                            list: [
                                { value: 'one', label: 'One' },
                                { value: 'two', label: 'Two' }
                            ],
                            where: null,
                            placeholder: "Sélectionner un groupe"
                        },
                    },
                    views: {
                        vall: {
                            title: 'Participants',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            elements: {
                                user_id: { is_hidden: true },
                                user_groupe_id: {},
                                user_pseudo: {},
                                user_email: {},
                                user_profil: {},
                                user_actif: {},
                                user_info: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "Participants",
                            group: 'ADMIN',
                            elements: {
                                user_groupe_id: {},
                                user_id: { is_hidden: true },
                                user_pseudo: {},
                                user_email: {},
                                user_profil: {},
                                user_actif: {},
                                user_info: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
                ceou_evt: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'evt_id',
                    elements: {
                        evt_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        evt_nom: {
                            label_long: "Evénement",
                            label_short: "Evénement",
                            type: "text",
                        },
                        evt_etat: {
                            label_long: "Ouvert",
                            label_short: "Ouvert",
                            title: "",
                            type: "check",
                            is_valide(value, ctx) {
                                return true
                            },
                            error: ""
                        },
                        evt_info: {
                            label_long: "Commentaires",
                            label_short: "Commentaires",
                            type: "textarea",
                        },
                        evt_groupe_id: {
                            label_long: "Groupe",
                            label_short: "Groupe",
                            jointure: {
                                table: "ceou_groupes",
                                value: "groupe_id",
                                label: "groupe_nom"
                            },
                            type: "jointure_select",
                            list: [
                                { value: 'one', label: 'One' },
                                { value: 'two', label: 'Two' }
                            ],
                            where: null,
                            placeholder: "Sélectionner un groupe"
                        },
                    },
                    views: {
                        vall: {
                            title: 'Evénements',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            elements: {
                                evt_id: { is_hidden: true },
                                evt_groupe_id: {},
                                evt_nom: {},
                                evt_etat: {},
                                evt_info: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "CEOU - Evénement",
                            group: 'ADMIN',
                            elements: {
                                evt_groupe_id: {},
                                evt_id: { is_hidden: true },
                                evt_nom: {},
                                evt_etat: {},
                                evt_info: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
                ceou: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'ceou_id',
                    elements: {
                        ceou_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        ceou_lieu: {
                            label_long: "Lieu",
                            label_short: "Lieu",
                            type: "text",
                        },
                        ceou_date: {
                            label_long: "Date",
                            label_short: "Date",
                            type: "text",
                        },
                        ceou_etat: {
                            label_long: "Ouvert",
                            label_short: "Ouvert",
                            title: "",
                            type: "check",
                            is_valide(value, ctx) {
                                return true
                            },
                            error: ""
                        },
                        ceou_info: {
                            label_long: "Commentaires",
                            label_short: "Commentaires",
                            type: "textarea",
                        },
                        ceou_evt_id: {
                            label_long: "Evénement",
                            label_short: "Evénement",
                            jointure: {
                                table: "ceou_evt",
                                value: "evt_id",
                                label: "evt_nom"
                            },
                            type: "jointure_select",
                            where: null,
                            placeholder: "Sélectionner un événement"
                        },
                    },
                    views: {
                        vall: {
                            title: 'Dates et lieux',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            elements: {
                                ceou_id: { is_hidden: true },
                                ceou_evt_id: {},
                                ceou_lieu: {},
                                ceou_date: {},
                                ceou_etat: {},
                                ceou_info: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "CEOU - Date et lieu de l'événement",
                            group: 'ADMIN',
                            elements: {
                                ceou_evt_id: {},
                                ceou_id: { is_hidden: true },
                                ceou_lieu: {},
                                ceou_date: {},
                                ceou_etat: {},
                                ceou_info: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
                ceou_forum: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'forum_id',
                    elements: {
                        forum_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        forum_date: {
                            label_long: "Date",
                            label_short: "Date",
                            type: "text",
                        },
                        forum_info: {
                            label_long: "Commentaires",
                            label_short: "Commentaires",
                            type: "textarea",
                        },
                        forum_evt_id: {
                            label_long: "Evénement",
                            label_short: "Evénement",
                            jointure: {
                                table: "ceou_evt",
                                value: "evt_id",
                                label: "evt_nom"
                            },
                            type: "jointure_select",
                            where: null,
                            placeholder: "Sélectionner un événement"
                        },
                        forum_user_id: {
                            label_long: "Participant",
                            label_short: "Participant",
                            jointure: {
                                table: "ceou_users",
                                value: "user_id",
                                label: "user_pseudo"
                            },
                            type: "jointure_select",
                            where: null,
                            placeholder: "Sélectionner un participant"
                        },
                    },
                    views: {
                        vall: {
                            title: 'Forum',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            elements: {
                                forum_id: { is_hidden: true },
                                forum_evt_id: {},
                                forum_user_id: {},
                                forum_date: {},
                                forum_info: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "CEOU - Forum message",
                            group: 'ADMIN',
                            elements: {
                                forum_evt_id: {},
                                forum_user_id: {},
                                forum_id: { is_hidden: true },
                                forum_date: {},
                                forum_info: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
                ceou_choix: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
                    key: 'choix_id',
                    elements: {
                        choix_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        choix_ok: {
                            label_long: "Oui",
                            label_short: "Oui",
                            title: "",
                            type: "text",
                            display: (val, ctx) => {
                                return val && val == '1'
                                    ? '<span class="fa fa-check w3-text-teal"></span>'
                                    : ''
                            },
                        },
                        choix_kk: {
                            label_long: "Si nécessaire",
                            label_short: "Si nécessaire",
                            title: "",
                            type: "text",
                            display: (val, ctx) => {
                                return val && val == '1'
                                    ? '<span class="w3-text-orange w3-center">(<span class="fa fa-check"></span>)</span>'
                                    : ''
                            },
                        },
                        choix_ko: {
                            label_long: "Nom",
                            label_short: "Non",
                            title: "",
                            type: "text",
                            display: (val, ctx) => {
                                return val && val == '1'
                                    ? '<span class="w3-text-red w3-large"><b>&Oslash;</b></span>'
                                    : ''
                            },
                        },
                        choix_cg: {
                            label_long: "Choix",
                            label_short: "Choix",
                            title: "",
                            type: "checkgroup",
                            is_multiple: false,
                            list: {
                                choix_ok: 'Oui',
                                choix_kk: 'si nécessaire',
                                choix_ko: 'Non'
                            },
                            is_valide(value, ctx) {
                                return true
                            },
                            error: ""
                        },
                        _choix: {
                            label_long: "Choix",
                            label_short: "Choix",
                            title: "",
                            type: "text",
                            display: (val, ctx) => {
                                return val && val == '1'
                                    ? '<span class="w3-text-red w3-large"><b>&Oslash;</b></span>'
                                    : ''
                            },
                        },
                        choix_ceou_id: {
                            label_long: "Date et lieu",
                            label_short: "Date et lieu",
                            jointure: {
                                table: "ceou",
                                value: "ceou_id",
                                label: "ceou_date"
                            },
                            type: "jointure_select",
                            where: null,
                            placeholder: "Sélectionner une date et lieu"
                        },
                        choix_user_id: {
                            label_long: "Participant",
                            label_short: "Participant",
                            jointure: {
                                table: "ceou_users",
                                value: "user_id",
                                label: "user_pseudo"
                            },
                            type: "jointure_select",
                            where: null,
                            placeholder: "Sélectionner un participant"
                        },
                    },
                    views: {
                        vall: {
                            title: 'Choix',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_edit: 'fall',
                            form_delete: 'fall',
                            order_by: "ceou_users.user_pseudo, ceou.ceou_lieu, ceou.ceou_date",
                            elements: {
                                choix_id: { is_hidden: true },
                                choix_user_id: {},
                                choix_ceou_id: {},
                                choix_ok: {},
                                choix_kk: {},
                                choix_ko: {},
                            }
                        },
                        vtcd: {
                            title: 'TCD',
                            group: 'ADMIN',
                            form_edit: 'ftcd',
                            order_by: "ceou_users.user_pseudo, ceou.ceou_lieu, ceou.ceou_date",
                            elements: {
                                choix_id: { is_hidden: true },
                                choix_user_id: {},
                                choix_ceou_id: {},
                                choix_ok: {},
                                choix_kk: {},
                                choix_ko: {},
                            }
                        }

                    },
                    forms: {
                        fall: {
                            title: "CEOU - Choix",
                            group: 'ADMIN',
                            elements: {
                                choix_id: { is_hidden: true },
                                choix_ceou_id: {},
                                choix_user_id: {},
                                choix_ok: { is_hidden: false, is_protect: true },
                                choix_kk: { is_hidden: true },
                                choix_ko: { is_hidden: true },
                                choix_cg: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                            compute(ctx) {
                                ctx.elements.choix_ok.value = '0'
                                ctx.elements.choix_kk.value = '0'
                                ctx.elements.choix_ko.value = '0'
                                if (ctx.elements.choix_cg.value && ctx.elements.choix_cg.value.length > 1) {
                                    ctx.elements[ctx.elements.choix_cg.value].value = '1'
                                }
                            },
                        },
                        ftcd: {
                            title: "CEOU - TCD",
                            group: 'ADMIN',
                            elements: {
                                choix_id: { is_hidden: true },
                                choix_ceou_id: {},
                                choix_user_id: {},
                                choix_ok: { is_hidden: false, is_protect: true },
                                choix_kk: { is_hidden: true },
                                choix_ko: { is_hidden: true },
                                choix_cg: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                            compute(ctx) {
                                ctx.elements.choix_ok.value = '0'
                                ctx.elements.choix_kk.value = '0'
                                ctx.elements.choix_ko.value = '0'
                                if (ctx.elements.choix_cg.value && ctx.elements.choix_cg.value.length > 1) {
                                    ctx.elements[ctx.elements.choix_cg.value].value = '1'
                                }
                            },
                        },
                    }
                },
            }
        },
        tex: {
            title: "TEX",
            desc: "Application pour tester le framework REACTEUR",
            // Groupe habilité à utiliser l'application
            // Si le user est dans le groupe, 
            // le bloc de l'application sera présenté dans le portail
            group: "ADMIN",
            // Liste des tables de l'application
            tables: {
                tex: {
                    // Chemin d'accès à la base sqlite
                    basename: '/home/billerot/conf/reacteur/tex.sqlite',
                    // Nom de la colonne de type clé unique de la table
                    key: 'id',
                    // Liste des rubriques de la table
                    // Les rubriques dont le nom commence par un undescore (_) est une rubrique de travail
                    // qui ne sera pas à définir dans la table
                    elements: {
                        // type TEXT calculé
                        tex_id: {
                            // Label de la rubrique affiché dans un formulaire
                            label_long: "ID",
                            // Label de la rubrique affiché dans l'entête de la colonne du tableau d'une vue
                            label_short: "ID",
                            // Type de la rubrique
                            // text, radio, checkgroup, mail, ...
                            type: "text",
                            // valeur par défaut qui peut être calculée
                            // L'exemple retourne un ID unique sur 23 caractères via le module randomstring
                            default: () => { return randomstring.generate(23) },
                            // la rubrique ne sera pas modifiable par l'utilisateur
                            is_protected: true,
                        },
                        // type TEXT
                        tex_pseudo: {
                            label_long: "Pseudo de l'utilisateur",
                            label_short: "Pseudo",
                            type: "text",
                            // Texte indicatif dans le champ avant la saisie
                            placeholder: "pseudo",
                            // Longueur max du champ de saisie
                            maxlength: 20,

                            // Contrôle de la saisie en utilisant les expressions régulières
                            pattern: "[A-Z,a-z,0-9]*",

                            // Méthode qui sera exécutée à chaque frappe de caractères
                            // Dans l'exemple, 
                            // - le champ ne doit pas être vide 
                            // - et d'une longueur minimum de 3 caractères
                            // NOTA: Cette méthode sera aussi exécutée sur le serveur
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 2
                            },
                            // Message affiché en rouge dessous le champ s'il n'est pas valide
                            error: "Obligatoire avec 3 caractères minimum",
                        },
                        // type PASSWORD
                        tex_pwd: {
                            label_long: "Mot de passe",
                            label_short: "",
                            type: "password",
                            maxlength: 50,
                            pattern: "[A-Z,a-z,0-9,_\-]*",
                            is_valide(value, ctx) {
                                return value.length > 7
                            },
                            error: "Obligatoire",
                            // La valeur enregistrée dans la base sera cryptée avec le module md5
                            server_record(value) {
                                return md5(value)
                            }
                        },
                        // type TEXT sql
                        tex_name: {
                            label_short: "Nom complet",
                            label_long: "Nom complet",
                            type: "text",
                            is_protected: true,
                            // Requête sql pour récupérer la valeur
                            // NOTA: les paramètres seront de la forme $nom_rubrique
                            server_select: "select user_name from actusers where user_pseudo = $tex_pseudo",
                        },
                        // type TEXT email
                        tex_email: {
                            label_short: "Email",
                            label_long: "Votre email",
                            type: "text",
                            // Contrôle du format de l'email
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && validator.isEmail(value)
                            },
                            error: "Adresse email non valide",
                        },
                        // type RADIO
                        tex_profil: {
                            label_long: "Profil",
                            label_short: "Profil",
                            type: "radio",
                            // Les options du radio seront définies dans list:
                            // VALEUR: "label"
                            list: {
                                ADM: "ADMIN",
                                USER: "PARTICIPANT"
                            },
                            default: "USER",
                        },
                        // type CHECK
                        tex_actif: {
                            label_long: "Actif",
                            label_short: "Actif",
                            // case à cocher
                            type: "check",
                        },
                        // type DATETIME
                        tex_date_update: {
                            label_long: "Mis à jour le",
                            label_short: "Mis à jour le",
                            type: "datetime",
                        },
                        // type CHECKGROUP
                        tex_language: {
                            label_long: "Langage",
                            label_short: "Langage",
                            type: "checkgroup",
                            is_multiple: true,
                            // jointure avec la table des langages informatiques
                            jointure: {
                                table: "tex_languages",
                                value: "lang_id",
                                label: "lang_name"
                            },
                        },
                        // type CHECKGROUP
                        tex_os: {
                            label_long: "Operating System",
                            label_short: "OS",
                            type: "checkgroup",
                            is_multiple: true,
                            // jointure avec la table des langages informatiques
                            list: {
                                WIN: "Windows",
                                ANDROID: "Androïd",
                                MACOS: "Mac OSX",
                                LINUX: "Linux"
                            },
                        },
                        // type TEXTAREA
                        tex_memo: {
                            label_long: "Mémo",
                            label_short: "Mémo",
                            type: "textarea",
                        },
                        // type INTEGER
                        tex_int: {
                            label_long: "Compteur",
                            label_short: "Compteur",
                            type: "integer",
                        },
                        // type NUMERIC montant
                        tex_amount: {
                            label_long: "Montant",
                            label_short: "Montant",
                            type: "numeric",
                        },
                        // type NUMERIC taux
                        tex_rate: {
                            label_long: "Taux",
                            label_short: "Taux",
                            type: "numeric",
                        },
                        // type LINK
                        _link_chg_pwd: {
                            label_long: "Changer mon mot de passe...",
                            type: "link",
                            // URL du lien
                            // NOTA: les paramètres seront de la forme :nom_rubrique
                            action_url: '/form/edit/reacteur/actusers/vident/fchgpwd/:pseudo'
                        },
                    },
                    // liste des vues de la table
                    views: {
                        vall: {
                            title: 'Tous les enregistrements',
                            group: 'ADMIN',
                            form_add: 'fmaj',
                            form_update: 'fmaj',
                            form_delete: 'fmaj',
                            elements: {
                                tex_id: {},
                                tex_pseudo: {},
                                tex_name: {},
                                tex_email: {},
                                tex_actif: {},
                                tex_profil: {}
                            }
                        }
                    },
                    // liste des formulaires de la table
                    forms: {
                        fmaj: {
                            title: "MISE A JOUR",
                            //action_title: 'Valider',
                            //return_route: '/',
                            group: 'ADMIN',
                            //owner: true,
                            elements: {
                                tex_id: {},
                                tex_pseudo: {},
                                tex_name: {},
                                tex_email: {},
                                tex_actif: {},
                                tex_profil: {}
                            },
                            is_valide(ctx) {
                                return true
                            },
                            compute(ctx) {
                            },
                            // server_check: [
                            //     "select 'Email inconnu' where not exists (select user_pseudo from actusers where user_email = $tok_email)",
                            // ],
                            server_post_update: []
                        }
                    }
                },
                tex_languages: { // voir ceou.sql
                    basename: '/home/billerot/conf/reacteur/tex.sqlite',
                    key: 'lang_id',
                    elements: {
                        lang_id: {
                            label_long: "Id",
                            label_short: "Id",
                            type: "text",
                            default: () => { return randomstring.generate(23) },
                        },
                        lang_name: {
                            label_long: "Langage",
                            label_short: "Langage",
                            type: "text",
                        },
                    },
                    views: {
                        vall: {
                            title: 'Langages',
                            group: 'ADMIN',
                            form_add: 'fall',
                            form_delete: 'fall',
                            elements: {
                                lang_id: { is_hidden: true },
                                lang_name: {},
                            }
                        }
                    },
                    forms: {
                        fall: {
                            title: "LANGAGES",
                            group: 'ADMIN',
                            elements: {
                                lang_id: { is_protect: true },
                                lang_name: {},
                            },
                            is_valide(ctx) {
                                return true
                            },
                        }
                    }
                },
            }
        },
        chinook: {
            title: "CHINOOK",
            desc: "Chinook database is an alternative to the Northwind database, being ideal for demos and testing ORM tools.",
            group: null,
            limit: 60,
            tables: {
                Artist: {
                    basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
                    key: 'ArtistId',
                    elements: {
                        ArtistId: {
                            label_long: "Artist Id",
                            label_short: "Artist Id",
                            type: "text",
                            is_read_only: true,
                        },
                        Name: {
                            label_long: "Artist name",
                            label_short: "Artist name",
                            type: "text",
                            placeholder: "name",
                            maxlength: 50,
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 1
                            },
                            error: "Required with 2 caracters minimum",
                        },
                        _albums: {
                            label_long: "Albums",
                            label_short: "Albums",
                            type: "view",
                            view: {
                                table: "Album",
                                view: "vartist",
                                where: "Album.ArtistId = $ArtistId"
                            }
                        },
                    },
                    views: {
                        vall: {
                            title: 'ARTISTS',
                            group: null,
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            //where: "name like '%ac%'",
                            with_filter: true,
                            elements: {
                                ArtistId: {},
                                Name: {},
                            },
                        }
                    },
                    forms: {
                        fmaj: {
                            title: "ARTIST",
                            group: null,
                            elements: {
                                ArtistId: {is_hidden: true},
                                Name: { grid: [3,6] },
                                _albums: { grid: [0,12] },
                            },
                        }
                    }
                },
                Album: {
                    basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
                    key: 'AlbumId',
                    elements: {
                        AlbumId: {
                            label_long: "Album Id",
                            label_short: "Album Id",
                            type: "text",
                            is_read_only: true,
                        },
                        Title: {
                            label_long: "Title",
                            label_short: "Title of album",
                            type: "text",
                            placeholder: "title",
                            maxlength: 100,
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 1
                            },
                            error: "Required",
                        },
                        ArtistId: {
                            label_long: "Artist Id",
                            label_short: "Artist Id",
                            type: "select",
                            jointure: {
                                table: "Artist",
                                value: "ArtistId",
                                label: "Name"
                            },
                        },
                    },
                    views: {
                        vall: {
                            title: 'ALBUMS',
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            with_filter: true,
                            elements: {
                                ArtistId: {},
                                AlbumId: {},
                                Title: {},
                            }
                        },
                        vartist: {
                            title: 'ALBUMS',
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            //with_filter: true,
                            elements: {
                                Title: {},
                            }
                        }

                    },
                    forms: {
                        fmaj: {
                            title: "ALBUM",
                            elements: {
                                ArtistId: {},
                                AlbumId: {},
                                Title: {},
                            },
                        }
                    }
                },
                MediaType: {
                    basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
                    key: 'MediaTypeId',
                    elements: {
                        MediaTypeId: {
                            label_long: "MediaType Id",
                            label_short: "MediaType Id",
                            type: "text",
                            is_read_only: true,
                        },
                        Name: {
                            label_long: "Media Type",
                            label_short: "Media Type",
                            type: "text",
                            placeholder: "name",
                            maxlength: 50,
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 1
                            },
                            error: "Required with 2 caracters minimum",
                        },
                    },
                    views: {
                        vall: {
                            title: 'MEDIA TYPE',
                            group: null,
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            //where: "name like '%ac%'",
                            with_filter: true,
                            elements: {
                                MediaTypeId: {},
                                Name: {},
                            },
                        }
                    },
                    forms: {
                        fmaj: {
                            title: "MEDIA TYPE",
                            group: null,
                            elements: {
                                MediaTypeId: {},
                                Name: {},
                            },
                        }
                    }
                },
                Genre: {
                    basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
                    key: 'GenreId',
                    elements: {
                        GenreId: {
                            label_long: "Genre",
                            label_short: "Genre",
                            type: "text",
                            is_read_only: true,
                        },
                        Name: {
                            label_long: "Genre",
                            label_short: "Genre",
                            type: "text",
                            placeholder: "name",
                            maxlength: 50,
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 1
                            },
                            error: "Required with 2 caracters minimum",
                        },
                    },
                    views: {
                        vall: {
                            title: 'GENRES',
                            group: null,
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            //where: "name like '%ac%'",
                            with_filter: true,
                            elements: {
                                GenreId: {},
                                Name: {},
                            },
                        }
                    },
                    forms: {
                        fmaj: {
                            title: "GENRES",
                            group: null,
                            elements: {
                                GenreId: {},
                                Name: {},
                            },
                        }
                    }
                },
                Track: {
                    basename: '/home/billerot/conf/reacteur/Chinook_Sqlite.sqlite',
                    key: 'TrackId',
                    elements: {
                        TrackId: {
                            label_long: "Genre",
                            label_short: "Genre",
                            type: "text",
                            is_read_only: true,
                        },
                        Name: {
                            label_long: "Track",
                            label_short: "Track",
                            type: "text",
                            placeholder: "track",
                            maxlength: 50,
                            is_valide(value, ctx) {
                                return !validator.isEmpty(value) && value.length > 1
                            },
                            error: "Required with 2 caracters minimum",
                        },
                        AlbumId: {
                            label_long: "Album Id",
                            label_short: "Album Id",
                            type: "select",
                            jointure: {
                                table: "Album",
                                value: "AlbumId",
                                label: "Title"
                            }
                        },
                        MediaTypeId: {
                            label_long: "Media Id",
                            label_short: "Media Id",
                            type: "select",
                            jointure: {
                                table: "MediaType",
                                value: "MediaTypeId",
                                label: "Name"
                            },
                        },
                        GenreId: {
                            label_long: "Genre Id",
                            label_short: "Genre Id",
                            type: "select",
                            jointure: {
                                table: "Genre",
                                value: "GenreId",
                                label: "Name"
                            },
                        },
                        Composer: {
                            label_long: "Composer",
                            label_short: "Composer",
                            type: "text",
                            placeholder: "composer",
                            maxlength: 100,
                            // is_valide(value, ctx) {
                            //     return !validator.isEmpty(value) && value.length > 1
                            // },
                            // error: "Required with 2 caracters minimum",
                        },
                        Milliseconds: {
                            label_long: "Milliseconds",
                            label_short: "Milliseconds",
                            type: "text",
                            placeholder: "milliseconds",
                            maxlength: 10,
                            // is_valide(value, ctx) {
                            //     return !validator.isEmpty(value) && value.length > 1
                            // },
                            // error: "Required with 2 caracters minimum",
                        },
                        Bytes: {
                            label_long: "Bytes",
                            label_short: "Bytes",
                            type: "text",
                            placeholder: "bytes",
                            maxlength: 10,
                            // is_valide(value, ctx) {
                            //     return !validator.isEmpty(value) && value.length > 1
                            // },
                            // error: "Required with 2 caracters minimum",
                        },
                        UnitPrice: {
                            label_long: "Unit Price",
                            label_short: "Unit Price",
                            type: "text",
                            placeholder: "unit price",
                            maxlength: 10,
                            // is_valide(value, ctx) {
                            //     return !validator.isEmpty(value) && value.length > 1
                            // },
                            // error: "Required with 2 caracters minimum",
                        },
                    },
                    views: {
                        vall: {
                            title: 'TRACKS',
                            group: null,
                            form_add: 'fmaj',
                            form_edit: 'fmaj',
                            form_delete: 'fmaj',
                            //where: "name like '%ac%'",
                            with_filter: true,
                            elements: {
                                AlbumId: {},
                                TrackId: {},
                                Name: {},
                                MediaTypeId: {},
                                GenreId: {},
                                Composer: {},
                                Milliseconds: {},
                                Bytes: {},
                                UnitPrice: {},
                            },
                        }
                    },
                    forms: {
                        fmaj: {
                            title: "TRACK",
                            group: null,
                            elements: {
                                AlbumId: {},
                                TrackId: {},
                                Name: {},
                                MediaTypeId: {},
                                GenreId: {},
                                Composer: {},
                                Milliseconds: {},
                                Bytes: {},
                                UnitPrice: {},
                            },
                        }
                    }
                },
            }
        },
    }
}
const ctx = {
    elements: {
    },
    session: { // set by your login
        // host: 'https://server:port',
        // user_pseudo: 'yourpseudo',
        // user_email: 'youremail@csp.com',
        // user_profil: 'INVITE',
    },
    filter: {}
}

export { ctx, Dico }