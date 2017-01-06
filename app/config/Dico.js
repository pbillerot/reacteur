/**
 * Déclaration du dictionnaire des rubriques,fieldsulaires et vues de l'application
 * 
 */
// https://www.npmjs.com/package/validator
import validator from 'validator'
import md5 from 'js-md5'
const Dico = {
    application: {
        title: 'REACTEUR',
        desc: 'REACTEUR, un simple CRUD',
        url: 'https://github.com/pbillerot/atomium',
        copyright: 'REACTEUR 2016 - version 1.1.6',
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
                );
                INSERT INTO ACTUSERS
                (user_id, user_email, user_profil, user_actif, user_pwd)
                values
                ('admin', 'philippe.billerot@gmail.com', 'ADMIN', '1', '');
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
                    help: "",
                    is_valide(value) {
                        return value.length > 2 && validator.isAlphanumeric(value)
                    },
                    error: "Longueur minimum de 3 car. et n'accepte que les caractères alphanumériques"
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
                    help: "",
                    is_valide(value) {
                        return !validator.isEmpty(value) && validator.isEmail(value)
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
                    required: false,
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value) {
                        return value.length > 7
                    },
                    error: "Obligatoire",
                    srv_record(value) {
                        return md5(value)
                    }
                },
                _user_pwd_1: {
                    label_long: "Créez un mot de passe",
                    label_short: "",
                    type: "password",
                    required: false,
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value) {
                        return value.length > 7
                    },
                    error: "Obligatoire, d'une longueur minimum de 8 caractères, n'accepte que les caractères A-Z a-z 0-9 _-",
                },
                _user_pwd_2: {
                    label_long: "Confirmer votre mot de passe",
                    label_short: "",
                    type: "password",
                    required: false,
                    maxlength: 50,
                    pattern: "[A-Z,a-z,0-9,_\-]*",
                    is_valide(value) {
                        return value.length > 7 && value == Dico.fields._user_pwd_1.value ? true : false
                    },
                    error: "Les mots de passe ne sont pas identiques",
                },
                _link_new_compte: {
                    label_long: "Créer un nouveau compte...",
                    type: "link",
                    action_url: '/form/add/actusers/vident/fnew/0'
                },
                _link_forget_pwd: {
                    label_long: "J'ai oublié mon mot de passe...",
                    title: "Un mail vous sera envoyé pour créer un nouveau mot de passe",
                    type: "link",
                    action_url: '/form/add/actusers/vident/forgetpwd/0'
                },
                _note_new_pwd: {
                    type: 'note',
                    note: "Vous recevrez un mail pour vous inviter à créer un nouveau mot de passe"
                },
                _link_chg_pwd: {
                    label_long: "Changer mon mot de passe...",
                    type: "link",
                    action_url: '/form/edit/actusers/vident/fchgpwd/:user_id'
                },
                _link_chg_email: {
                    label_long: "Changer mon adresse email...",
                    type: "link",
                    action_url: '/form/edit/actusers/vident/fchgemail/:user_id'
                },
                _link_adm_compte: {
                    label_long: "Administrer les comptes...",
                    type: "link",
                    groups: ['ADMIN'],
                    action_url: '/view/actusers/vall'
                },
                _mail: {
                    label_long: "Envoyer le mail",
                    type: "mail",
                    groups: ['ADMIN'],
                    mail: {
                        from: '"Philippe" <philippe.billerot@gmail.com>', // sender address
                        to: 'philippe.billerot@free.com', // list of receivers
                        subject: 'Hello ✔', // Subject line
                        text: 'Hello world ?', // plaintext body
                        html: '<b>Hello world ?</b>' // html body
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
                    is_hidden: true,
                    groups: ['ADMIN'],
                    cols: {
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
                    form_edit: null,
                    form_delete: null,
                    is_hidden: true,
                    groups: [],
                    cols: {
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
                    groups: [],
                    cols: {
                    }
                }
            },
            forms: {
                fall: {
                    title: 'USER',
                    groups: ['ADMIN'],
                    fields: {
                        user_id: {},
                        //user_pwd: {},
                        user_email: {},
                        user_profil: {},
                        user_actif: {}
                    }
                },
                fnew: {
                    title: "Création d'un compte",
                    action_title: 'Créer',
                    groups: [],
                    fields: {
                        user_id: {},
                        user_email: {},
                        _user_pwd_1: {},
                        _user_pwd_2: {},
                        user_pwd: { is_hidden: true },
                        user_actif: { is_hidden: true },
                        user_profil: { is_hidden: true }
                    },
                    checkForm() {
                        return true
                    },
                    computeForm() {
                        Dico.fields.user_pwd.value = Dico.fields._user_pwd_1.value
                        Dico.fields.user_actif.value = '1'
                        Dico.fields.user_profil.value = 'INVITE'
                    }

                },
                fident: {
                    title: 'CONNEXION',
                    action_title: 'Valider',
                    groups: [],
                    fields: {
                        user_id: {},
                        user_pwd: {},
                        _link_new_compte: {},
                        _link_forget_pwd: {}
                    }
                },
                fchgemail: {
                    title: "Changer mon adresse email",
                    action_title: 'Valider',
                    return_url: '/',
                    groups: [],
                    owner: 'user_id',
                    fields: {
                        user_id: { is_read_only: true },
                        user_email: {},
                    }
                },
                fchgpwd: {
                    title: "Changer mon mot de passe",
                    action_title: 'Valider',
                    return_url: '/',
                    groups: [],
                    owner: 'user_id',
                    fields: {
                        user_id: { is_read_only: true },
                        user_email: { is_read_only: true },
                        _user_pwd_1: {},
                        _user_pwd_2: {},
                        user_pwd: { is_hidden: true }
                    },
                    computeForm() {
                        Dico.fields.user_pwd.value = Dico.fields._user_pwd_1.value
                    }
                },
                forgetpwd: {
                    title: "J'ai perdu mon mot de passe",
                    action_title: 'Envoyer',
                    return_url: '/',
                    groups: [],
                    owner: 'user_id',
                    fields: {
                        _note_new_pwd: {},
                        user_email: {}
                    }
                },
                fmenuident: {
                    title: "Mon compte",
                    action_title: 'Envoyer',
                    return_url: '/',
                    groups: [],
                    owner: 'user_id',
                    fields: {
                        user_id: { is_read_only: true },
                        user_email: { is_read_only: true },
                        _link_chg_pwd: {},
                        _link_chg_email: {},
                        _link_adm_compte: {}
                    }
                }
            }
        }
    },
    isRubTemporary(key) {
        return /^_/g.test(key)
    },
    replaceParams(uri) {
        let params = uri.split('/')
        let str = ''
        params.forEach(param => {
            if (param.length > 0) {
                if (param.startsWith(':')) {
                    let field = param.substring(1)
                    str = str + '/' + Dico.fields[field].value
                } else {
                    str = str + '/' + param
                }
            }
        })
        return str
    },
    fields: {}
} // end exports
export { Dico }