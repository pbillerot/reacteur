# DEVELOPPER UNE APPLICATION REACTEUR

REACTEUR est un framework de développement.

Les fonctionnalités de l'application à développer sont décrites dans un fichier texte dans un format JSON.

Par exemple le vue "LISTE DES COMPTES" le fichier JSON a la forme suivante :

```javascript
tables: {
    comptes: {
        /* 
        CREATE TABLE "comptes" (
            "compte_id" varchar(15) NOT NULL,
            "compte_email" varchar(70) null,
            "compte_profil" varchar(20) null,
            "compte_pwd" varchar(255) null,
            primary key(compte_id)
        )
        */
        basename: '/home/billerot/conf/reacteur/reacteur.sqlite',
        key: 'compte_id',
        rubs: {
            compte_id: {
                label_long: "Pseudo",
                label_short: "Pseudo",
                type: "text",
                required: true,
                maxlength: 15,
                pattern: "[A-Z,a-z,0-9]*",
                placeholder: "",
                list: null, //val1,val2
                default: "",
                help: "Le pseudo sera unique",
                is_valide(value) {
                    return validator.isAlphanumeric(value) && !validator.isEmpty(value)
                },
                error: "Obligatoire et n'accepte que les caractères alphanumériques"
            },
            compte_email: {
                label_long: "Email",
                label_short: "Email",
                type: "email",
                required: true,
                maxlength: 15,
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
            compte_profil: {
                label_long: "Profil",
                label_short: "Profil",
                title: "",
                type: "select",
                required: true,
                maxlength: 15,
                pattern: "[A-Z,a-z,0-9]*",
                placeholder: "",
                list: {
                    admin: "Admin",
                    invite: "Invité"
                },
                default: "invite",
                is_valide(value) {
                    return true
                },
                error: ""
            }
        },
        views: {
            vall: {
                title: 'LISTE DES COMPTES',
                form_add: 'fall',
                form_view: 'fall',
                form_edit: 'fall',
                form_delete: 'fall',
                rubs: {
                    compte_id: {},
                    compte_email: {},
                    compte_profil: {},
                }
            }
        },
        forms: {
            fall: {
                title: 'COMPTE',
                rubs: {
                    compte_id: {},
                    compte_email: {},
                    compte_profil: {}
                }
            }
        }
    }
}
```


P.BILLEROT
