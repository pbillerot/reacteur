'use strict';

import React from 'react';
import { Link } from 'react-router';
import ContainerBody from './ContainerBody';
import ContainerContent from './ContainerContent';
import ContainerFooter from './ContainerFooter';
import ContainerHeader from './ContainerHeader';
import ContainerPortail from './ContainerPortail';
import ContainerSidebar from './ContainerSidebar';
import Dico from '../data/Dico.js';

var PageLayout = {
  HOME: 'HOME',
  VIEW: 'VIEW',
  FORM: 'FORM',
  HELP: 'HELP'
};
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Layout
      layout: 'HOME', // voir PageLayout
      title: Dico.application.desc, // Titre de la fenêtre
      // W3
      w3_menu_current: null,
      w3_sidebar_open: false,
      // Dialog
      about: false,
      // DICTIONNAIRE
      table: null,
      view: null,
      form: null,
      // Formulaire
      key_id: null,
      key_value: null,
      action_form: 'UPDATE', // INSERT UPDATE DELETE
      form_valid: false,
      // Tableur
      rows: [],
      rows_selected: [],
    }
    this.handleState = this.handleState.bind(this);
    this.handleOpenView = this.handleOpenView.bind(this);
  }

  /**
  * Juste pour déclencher une actualisation de données du contexte
  */
  handleState(state) {
    //console.log(JSON.stringify(state, null, 4))
    this.setState(state)
  }

  /**
   * Enregistrement des données du formulaire dans la table
   */
  handleUpdateForm(action) {
    //console.log('handleUpdateForm: ' + action)
    let rubs = Dico.tables[this.state.table].rubs
    let fields = Dico.tables[this.state.table].forms[this.state.form].rubs
    let sql = ''

    switch (action) {
      case 'UPDATE':
        Object.keys(fields).forEach((key) => {
          if (!isRubTemporary(key)) {
            sql += sql.length > 0 ? ", " : ""
            sql += key + " = '" + fields[key].value + "'"
          }
        })
        sql = 'UPDATE ' + this.state.table + ' SET ' + sql
        sql += " WHERE " + this.state.key_id + " = '" + this.state.key_value + "'"
        break;
      case 'INSERT':
        Object.keys(fields).forEach((key) => {
          if (!isRubTemporary(key)) {
            sql += sql.length > 0 ? ", " : ""
            sql += key
          }
        })
        sql = "(" + sql + ") VALUES ("
        let val = ''
        Object.keys(fields).forEach((key) => {
          if (!isRubTemporary(key)) {
            val += val.length > 0 ? ", " : ""
            val += "'" + fields[key].value + "'"
          }
        })
        sql = 'INSERT INTO ' + this.state.table + ' ' + sql + val + ')'
        break;
      case 'DELETE':
        let sqlin = ""
        this.state.rows_selected.forEach((key) => {
          sqlin += sqlin.length > 0 ? "," : "("
          sqlin += "'" + key + "'"
        })
        sqlin += ")"
        sql = 'DELETE FROM ' + this.state.table
        sql += " WHERE " + this.state.key_id + " in " + sqlin
        break;
      default:
        break;
    }

    let db = new sqlite3.Database(Dico.tables[this.state.table].basename);
    var result = (callback) => {
      db.serialize(function () {
        db.run(sql, [], function (err) {
          if (err) {
            console.log("ERR: " + sql)
            throw err
          }
          console.log("UPDATE: " + JSON.stringify(this, null, 4))
          callback(this)
        });
        db.close()
      });
    }
    result((res) => {
      this.handleOpenView()
    })
  }
  /**
   * Sélection d'une vue
   */
  handleOpenView() {
    let db = new sqlite3.Database(Dico.tables[this.state.table].basename, sqlite3.OPEN_READONLY);
    let select = ''
    let rubs = Dico.tables[this.state.table].rubs
    let cols = Dico.tables[this.state.table].views[this.state.view].rubs
    this.state.key_id = Dico.tables[this.state.table].key
    Object.keys(cols).forEach((key) => {
      if (!isRubTemporary(key))
        select += select.length > 0 ? ', ' + key : key
    })
    select = 'SELECT ' + select + ' FROM ' + this.state.table
    var result = (callback) => {
      db.serialize(function () {
        db.all(select, function (err, rows) {
          if (err) {
            console.log("VIEW: " + select)
            throw err
          }
          console.log("VIEW: " + JSON.stringify(this, null, 4))
          callback(rows)
        });
        db.close()
      });
    }
    result((rows) => {
      //console.log(JSON.stringify(rows))
      var tableur = []
      rows.forEach((row) => {
        // insertion des colonnes des rubriques temporaires
        let ligne = {}
        let key_value = ''
        Object.keys(cols).forEach(key => {
          if (key == this.state.key_id) {
            key_value = row[key]
          }
          if (isRubTemporary(key)) {
            ligne[key] = key_value
          } else {
            ligne[key] = row[key]
          }
        })
        tableur.push(ligne)
      })
      //console.log(JSON.stringify(tableur))
      this.setState({
        title: Dico.tables[this.state.table].views[this.state.view].title,
        layout: PageLayout.VIEW,
        rows_selected: [], rows: tableur
      })
    })
  }

  handleOpenForm(action) {
    //console.log('handleOpenForm: ' + action)
    //console.log('state: ' + JSON.stringify(this.state, null, 4))

    let select = ''
    let form = this.state.form
    let rubs = Dico.tables[this.state.table].rubs
    let fields = Dico.tables[this.state.table].forms[form].rubs

    this.state.key_id = Dico.tables[this.state.table].key

    Object.keys(fields).forEach((key) => {
      if (!isRubTemporary(key)) {
        select += select.length > 0 ? ', ' + key : key
        fields[key].value = ''
      }
      //console.log(key + ': ' + JSON.stringify(rubs[key], null, 4))
    })
    //console.log(select)
    if (action == 'UPDATE') {
      select = 'SELECT ' + select + ' FROM ' + this.state.table
      select += " WHERE " + this.state.key_id + " = '" + this.state.key_value + "'"
      let db = new sqlite3.Database(Dico.tables[this.state.table].basename, sqlite3.OPEN_READONLY);
      var result = (callback) => {
        db.serialize(function () {
          db.all(select, function (err, rows) {
            if (err) throw err
            console.log("FORM: " + JSON.stringify(this, null, 4))
            callback(rows)
          });
          db.close()
        });
      }
      result((rows) => {
        Object.keys(fields).map(key => {
          if (!isRubTemporary(key)) {
            fields[key].value = rows[0][key]
          } else {
            fields[key].value = ''
          }
        })
        this.state.key_value = fields[this.state.key_id].value

        this.setState({ layout: PageLayout.FORM, action_form: action })
      })
    }
    if (action == 'INSERT') {
      this.setState({ layout: PageLayout.FORM, action_form: action })
    }
  }

  render() {
    return (
      <ContainerBody ctx={this}>
        <ContainerSidebar ctx={this} />
        <ContainerContent>
        <ContainerHeader ctx={this} />
          <ContainerPortail ctx={this} />
          <ContainerFooter ctx={this} />
        </ContainerContent>
      </ContainerBody>
    );
  }
}

      // <ContainerBody>
      //   <ContainerSidebar ctx={this} />
      //   <ContainerContent>
      //     <HeaderContainer ctx={this} />
      //     <ContainerPortail ctx={this} />
      //     <ContainerPortail ctx={this} />
      //   </ContainerContent>
      // </ContainerBody>
