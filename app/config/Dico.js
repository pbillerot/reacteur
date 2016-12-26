/**
 * Déclaration du dictionnaire des rubriques, formulaires et vues de l'application
 * 
 */
module.exports = {
    application: {
        title: 'REACTEUR',
        desc: 'REACTEUR, un simple CRUD',
        url: 'https://github.com/pbillerot/atomium',
        copyright: 'REACTEUR 2016 - version 1.0.0',
    },
    tables: {
        USERS: {
            basename: '/home/billerot/conf/acteur/tex.sqlite',
            key: 'IDUSER',
            rubs: {
                IDUSER: {
                    label_long: 'COMPTE',
                    label_short: 'COMPTE',
                    type: 'text',
                    length: 9,
                    formatter: null,
                    required: true,
                    default: '',
                    pattern: "[A-Z,a-z]*",
                    error: "Obligatoire",
                    tooltip: null,
                    list: null, //val1,val2
                    options: ''
                },
                NOMUSER: {
                    label_long: 'NOM ou PSEUDO',
                    label_short: 'NOM',
                    type: 'text',
                    length: 70,
                    form: 'FORM_1',
                    formatter: null,
                    default: '',
                    pattern: null,
                    tooltip: 'Nom ou le pseudo du compte',
                    list: null, //val1,val2
                    options: ''
                },
                EMAIL: {
                    label_long: 'EMAIL',
                    label_short: 'EMAIL',
                    type: 'email',
                    length: 70,
                    formatter: null,
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: 'Email du compte',
                    list: null, //val1,val2
                    options: ''
                },
                _BTN: {
                    label_long: '',
                    label_short: '',
                    type: 'btn_edit',
                    length: 20,
                    formatter: null,
                    form: 'FORM_2',
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: null,
                    list: null,
                    options: ''
                },
                _DEL: {
                    label_long: '',
                    label_short: '',
                    type: 'btn_delete',
                    length: 20,
                    formatter: null,
                    form: 'FORM_2',
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: null,
                    list: null,
                    options: ''
                }
            },
            views: {
                VUE_1: {
                    title: 'LISTE DES COMPTES',
                    form_add: 'FORM_1',
                    form_edit: 'FORM_1',
                    form_delete: 'FORM_1',
                    rubs: {
                        _BTN: {},
                        IDUSER: {},
                        NOMUSER: {},
                        EMAIL: {},
                        _DEL: {}
                    }
                },
                VUE_2: {
                    title: 'LISTE DES UTILISATEURS',
                    form_add: 'FORM_2',
                    form_edit: 'FORM_2',
                    form_delete: null,
                    rubs: {
                        IDUSER: {},
                        NOMUSER: {}
                    }
                }
            },
            forms: {
                FORM_1: {
                    title: 'COMPTE',
                    rubs: {
                        IDUSER: {},
                        NOMUSER: {},
                        EMAIL: {},
                    }
                },
                FORM_2: {
                    title: 'EMAIL',
                    rubs: {
                        IDUSER: {},
                        EMAIL: {},
                    }
                }

            }
        },
        TEX: {
            basename: '/home/billerot/conf/acteur/tex.sqlite',
            key: 'cleunique',
            rubs: {
                cleunique: {
                    label_long: 'ID',
                    label_short: 'ID',
                    type: 'text',
                    length: 23,
                    formatter: null,
                    required: true,
                    default: '',
                    pattern: "[A-Z,a-z,0-9_]*",
                    error: "Obligatoire",
                    tooltip: null,
                    list: null, //val1,val2
                    options: ''
                },
                nom: {
                    label_long: 'NOM ou PSEUDO',
                    label_short: 'NOM',
                    type: 'text',
                    length: 70,
                    formatter: null,
                    default: '',
                    pattern: null,
                    tooltip: 'Nom ou le pseudo du compte',
                    list: null, //val1,val2
                    options: ''
                },
                email: {
                    label_long: 'EMAIL',
                    label_short: 'EMAIL',
                    type: 'email',
                    length: 70,
                    editable: true,
                    formatter: null,
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: 'Email du compte',
                    list: null, //val1,val2
                    options: ''
                },
                _btn: {
                    label_long: '',
                    label_short: 'BTN',
                    type: 'btn',
                    length: 20,
                    formatter: null,
                    form: 'F_2',
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: null,
                    list: null,
                    options: ''
                }
            },
            views: {
                V_1: {
                    title: 'TEX COMPTES',
                    form_add: 'F_1',
                    form_edit: 'F_1',
                    form_delete: null,
                    rubs: {
                        cleunique: {},
                        nom: {},
                        email: {},
                        _btn: {}
                    }
                },
                V_2: {
                    title: 'TEX EMAIL',
                    form_add: 'F_2',
                    form_edit: 'F_2',
                    form_delete: null,
                    rubs: {
                        cleunique: {},
                        email: {}
                    }
                }
            },
            forms: {
                F_1: {
                    title: 'TEX COMPTE',
                    rubs: {
                        cleunique: {},
                        nom: {},
                        email: {},
                    }
                },
                F_2: {
                    title: 'TEX EMAIL',
                    rubs: {
                        cleunique: {},
                        email: {},
                    }
                }

            }
        }
     },
    isRubTemporary(key) {
        return /^_/g.test(key)
    }
} // end exports
