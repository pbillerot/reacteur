
module.exports = {
    title: "TEX",
    desc: "Tables EXemples pour tester le framework REACTEUR",
    version: "1.3.8",
    // Groupe habilité à utiliser l'application
    // Si le user est dans le groupe, 
    // le bloc de l'application sera présenté dans le portail
    //group: "ADMIN",
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
                    default: (ctx) => { return randomstring.generate(23) },
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
                    //group: 'ADMIN',
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
                    //group: 'ADMIN',
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
                    default: (ctx) => { return randomstring.generate(23) },
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
                    //group: 'ADMIN',
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
                    //group: 'ADMIN',
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
}
