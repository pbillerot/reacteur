import validator from 'validator'
import md5 from 'js-md5'
import randomstring from 'randomstring'
import moment from 'moment'
const { Tools } = require('../../Tools')

module.exports =
    {
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
                        default: (ctx) => { return randomstring.generate(23) },
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
                        default: (ctx) => { return randomstring.generate(23) },
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
                        default: (ctx) => { return randomstring.generate(23) },
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
                        default: (ctx) => { return randomstring.generate(23) },
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
                        default: (ctx) => { return randomstring.generate(23) },
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
                        default: (ctx) => { return randomstring.generate(23) },
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
    }

