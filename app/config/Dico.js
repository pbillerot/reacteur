/**
 * Déclaration du dictionnaire des rubriques, formulaires et vues de l'application
 * 
 */
// https://www.npmjs.com/package/validator
import validator from 'validator'
import md5 from 'js-md5'
module.exports = {
    application: {
        title: 'REACTEUR',
        desc: 'REACTEUR, un simple CRUD',
        url: 'https://github.com/pbillerot/atomium',
        copyright: 'REACTEUR 2016 - version 1.1.3',
    },
    tables: {
        actusers: {
            /* 
                CREATE TABLE "ACTUSERS" (
                    "user_id" varchar(20) NOT NULL,
                    "user_email" varchar(70) NOT NULL,
                    "user_profil" varchar(20) NULL,
                    "user_actif" varchar(1) NULL,
                    "user_pwd" varchar(255) NULL,
                    primary key(user_id)
                )
            */
            basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
            key: 'user_id',
            rubs: {
                user_id: {
                    label_long: "Pseudo",
                    label_short: "Pseudo",
                    type: "text",
                    required: true,
                    maxlength: 15,
                    pattern: "[A-Z,a-z,0-9]*",
                    placeholder: "",
                    list: null, //val1,val2
                    default: "",
                    help: "Le pseudo sera unique dans la base",
                    is_valide(value) {
                        return validator.isAlphanumeric(value) && !validator.isEmpty(value)
                    },
                    error: "Obligatoire et n'accepte que les caractères alphanumériques"
                },
                user_email: {
                    label_long: "Email",
                    label_short: "Email",
                    type: "email",
                    required: true,
                    maxlength: 70,
                    pattern: "[A-Z,a-z,0-9]*",
                    placeholder: "",
                    list: null, //val1,val2
                    default: "",
                    help: "L'adresse email sera de la forme nom@fournisseur.extension",
                    is_valide(value) {
                        return validator.isEmpty(value) ? true : validator.isEmail(value)
                    },
                    error: "Adresse email non valide"
                },
                user_profil: {
                    label_long: "Profil",
                    label_short: "Profil",
                    title: "",
                    type: "radio",
                    required: true,
                    maxlength: 15,
                    list: {
                        ADMIN: "ADMIN",
                        INVITE: "INVITE"
                    },
                    default: "INVITE",
                    is_valide(value) {
                        return true
                    },
                    error: ""
                },
                user_actif: {
                    label_long: "Actif",
                    label_short: "Actif",
                    title: "",
                    type: "check",
                    is_valide(value) {
                        return true
                    },
                    error: ""
                },
                user_pwd: {
                    label_long: "Mot de passe",
                    label_short: "",
                    type: "password",
                    required: true,
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value) {
                        return value.length > 7
                    },
                    error: "Obligatoire, d'une longueur minimum de 8 caractères, n'accepte que les caractères A-Z a-z 0-9 _-",                    
                }
            },
            views: {
                vall: {
                    title: 'Gestion des comptes...',
                    form_add: 'fall',
                    form_view: 'fall',
                    form_edit: 'fall',
                    form_delete: 'fall',
                    is_hidden: true,
                    groups: ['ADMIN'],
                    rubs: {
                        user_id: {},
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
                    //form_edit: null,
                    form_delete: null,
                    is_hidden: true,
                    groups: [],
                    rubs: {
                    }
                }
            },
            forms: {
                fall: {
                    title: 'USER',
                    groups: ['ADMIN'],
                    rubs: {
                        user_id: {},
                        //user_pwd: {},
                        user_email: {},
                        user_profil: {},
                        user_actif: {}
                    }
                },
                fident: {
                    title: 'CONNEXION',
                    action_title: 'Valider',
                    groups: [],
                    rubs: {
                        user_id: {},
                        user_pwd: {}
                    }
                }
            }
        }
    },
    isRubTemporary(key) {
        return /^_/g.test(key)
    }
} // end exports
