/**
 * Déclaration du dictionnaire des rubriques, formulaires et vues de l'application
 * id: toujours en majuscule
 */
module.exports = {
    application: {
        title: 'REACTEUR',
        desc: 'CRUD with Dictionary',
        url: 'https://github.com/pbillerot/atomium',
        copyright: 'REACTEUR 2016 - version 1.0.0',
    },
    tables: {
        comptes: {
            basename: 'comptes.js',
            key: 'email',
            rubs: {
                email: {
                    label_long: 'EMAIL',
                    label_short: 'EMAIL',
                    type: 'text',
                    length: 70,
                    formatter: null,
                    required: true,
                    default: '',
                    pattern: "[A-Z,a-z,0-9_]*",
                    error: "Obligatoire",
                    tooltip: null,
                    list: null, //val1,val2
                    options: ''
                },
                pseudo: {
                    label_long: 'NOM ou PSEUDO',
                    label_short: 'PSEUDO',
                    type: 'text',
                    length: 50,
                    formatter: null,
                    default: '',
                    pattern: null,
                    tooltip: 'Nom ou le pseudo du compte',
                    list: null, //val1,val2
                    options: ''
                },
                profil: {
                    label_long: 'PROFIL',
                    label_short: 'PROFIL',
                    type: 'select',
                    length: 50,
                    editable: true,
                    formatter: null,
                    default: '',
                    pattern: null,
                    error: null,
                    tooltip: 'Email du compte',
                    list: ['ADMIN', 'INVITE'],
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
                    title: 'COMPTES',
                    form_add: 'F_1',
                    form_update: 'F_1',
                    form_delete: null,
                    rubs: {
                        email: {},
                        pseudo: {},
                        profil: {},
                        _btn: {}
                    }
                }
            },
            forms: {
                F_1: {
                    title: 'COMPTE',
                    rubs: {
                        email: {},
                        pseudo: {},
                        profil: {},
                    }
                }
            }
        }
    },
    isRubTemporary(key) {
        return /^_/g.test(key)
    }
} // end exports
