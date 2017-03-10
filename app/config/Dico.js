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
        copyright: 'build with REACTEUR 2016 - version 1.3.10',
    },
    apps: {
    }
}

export { Dico }