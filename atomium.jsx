const React = require('react')
const ReactDOM = require('react-dom')
const ReactMarkdown = require('react-markdown-it')
const sqlite3 = require('sqlite3').verbose();

// W3
const {Button, Card, Content, Footer, Header, IconButton
    , Menubar, Nav, Navbar, NavGroup, Sidebar, Table, Window} = require('./components.jsx')

const Dico = require('./dico')
const data = require('./data')
const sqlite = require('./sqlite')
const fs = require('fs')

function isRubTemporary(key) {
    return /^_/g.test(key)
}

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
        switch (this.state.layout) {
            case PageLayout.HOME:
                return (
                    <Window>
                        <SidebarPage ctx={this} />
                        <Content>
                            <HeaderPage ctx={this} />
                            <Portail ctx={this} />
                            <FooterPage ctx={this} />
                        </Content>
                        <APropos ctx={this} />
                    </Window>
                )
            case PageLayout.VIEW:
                return (
                    <Window>
                        <SidebarPage ctx={this} />
                        <Content>
                            <HeaderPage ctx={this} />
                            <Tableur ctx={this} />
                        </Content>
                        <APropos ctx={this} />
                    </Window>
                )
            case PageLayout.FORM:
                return (
                    <Window>
                        <SidebarPage ctx={this} />
                        <Content>
                            <HeaderPage ctx={this} />
                            <FormContent ctx={this} />
                        </Content>
                        <APropos ctx={this} />
                    </Window>
                )
            case PageLayout.HELP:
                return (
                    <Window>
                        <SidebarPage ctx={this} />
                        <Content>
                            <HeaderPage ctx={this} />
                            <Help ctx={this} />
                        </Content>
                        <APropos ctx={this} />
                    </Window>
                )
            default:
                return null
        }
    }
}

class HeaderPage extends React.Component {

    render() {
        let table = this.props.ctx.state.table
        let view = this.props.ctx.state.view
        let form = this.props.ctx.state.form
        switch (this.props.ctx.state.layout) {
            case PageLayout.HOME:
                return (
                    <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                    </Header>
                )
            case PageLayout.HELP:
                return (
                    <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                    </Header>
                )
            case PageLayout.VIEW:
                if (this.props.ctx.state.rows_selected.length == 1) {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="plus-circled"
                                    onClick={(event) => {
                                        this.props.ctx.state.form = Dico.tables[table].views[view].form_update
                                        this.props.ctx.handleOpenForm('UPDATE')
                                    }
                                    } />
                                <Button color="default" icon="trash"
                                    onClick={(event) => {
                                        this.props.ctx.handleUpdateForm('DELETE')
                                    }
                                    } />
                            </Toolbar>
                        </Header>
                    )
                } else if (this.props.ctx.state.rows_selected.length > 1) {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                            <Toolbar>
                                <Button color="default" icon="trash"
                                    onClick={(event) => this.props.ctx.handleUpdateForm('DELETE')} />
                            </Toolbar>
                        </Header>
                    )
                } else {
                    return (
                        <Header title={this.props.ctx.state.title} ctx={this.props.ctx}>
                        </Header>
                    )
                }

            case PageLayout.FORM:
                return (
                    <Header title={this.props.ctx.state.title}>
                    </Header>
                )

            default:
                return null

        }
    }
}

class FooterPage extends React.Component {
    github(event) {
        window.open(Dico.application.url
            , 'github'
            , 'toolbar=0,status=0,width=1024,height=800');
    }
    render() {
        return (
            <Footer ctx={this}>
                <p>{Dico.application.copyright}</p>
            </Footer>
        )
    }
}

class Portail extends React.Component {
    render() {
        return (
            <Card>
                <div className="w3-container w3-section w3-padding-32 w3-card-4 w3-light-grey w3-large">
                    Le framework pour développer des applications en décrivant
                    les rubriques, les formulaires, les vues dans un dictionnaire
                </div>
            </Card>
        )
    }
}

class SidebarPage extends React.Component {
    closeDrawer() {
        document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer();
    }
    handleAPropos(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.handleState({ about: true })
    }
    handleAccueil(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.setState({ title: 'Aide', layout: PageLayout.HOME })
    }
    handleHelp(e) {
        e.preventDefault
        this.closeDrawer()
        this.props.ctx.setState({ title: 'Aide', layout: PageLayout.HELP })
    }
    render() {
        var table = 'TEX'
        return (
            <Sidebar title={Dico.application.title} ctx={this.props.ctx}>
                {
                    Object.keys(Dico.tables).map(table =>
                        <LinkView table={table} key={table} ctx={this.props.ctx} />
                    )
                }
            </Sidebar>
        );
    }
}
class LinkView extends React.Component {
    constructor(props) {
        super(props);
        this.handleClickView = this.handleClickView.bind(this);
    }
    handleClickView(table, view, event) {
        event.preventDefault()
        this.props.ctx.state.table = table
        this.props.ctx.state.view = view
        this.props.ctx.state.w3_menu_current = table + '_' + view
        this.props.ctx.handleOpenView()
    }
    closeDrawer() {
        document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer();
    }
    render() {
        return (
            <div>
                {
                    Object.keys(Dico.tables[this.props.table].views).map(view =>
                        <Nav onClick={this.handleClickView} ctx={this.props.ctx} key={this.props.table + '_' + view}
                            table={this.props.table} view={view}>
                            {Dico.tables[this.props.table].views[view].title}
                        </Nav>
                    )
                }
            </div>
        )
    }
}

class Help extends React.Component {
    render() {
        let data = fs.readFileSync(__dirname + '/help.md', 'utf8')
        return (
            <Card style={{ width: '100%', margin: 'auto' }}>
                <CardText>
                    <ReactMarkdown source={data} />
                </CardText>
            </Card>
        )
    }
}

class APropos extends React.Component {
    render() {
        return (
            <div />
            // <Dialog open={this.props.ctx.state.about} onCancel={(data) => this.props.ctx.setState({ about: false })}>
            //     <DialogTitle>{Dico.application.title}</DialogTitle>
            //     <DialogContent>
            //         <p>{Dico.application.desc}</p>
            //         <p>{Dico.application.copyright}</p>
            //     </DialogContent>
            //     <DialogActions>
            //         <Button type='button' onClick={(data) => this.props.ctx.setState({ about: false })}>Fermer</Button>
            //     </DialogActions>
            // </Dialog>
        )
    }
}

class Tableur extends React.Component {
    constructor(props) {
        super(props);
        this.handleEditRow = this.handleEditRow.bind(this);
    }

    selectionChanged(data) {
        this.props.ctx.handleState({ rows_selected: data, key_value: data[0] })
    }
    add(form) {
        this.props.ctx.handleState({ form: form, rows_selected: [], key_value: [], action_form: 'INSERT' })
        this.props.ctx.handleOpenForm('INSERT')
    }
    columns(rubs, cols) {
        let columns = []
        Object.keys(cols).forEach(key => {
            columns.push({
                name: key,
                title: rubs[key].label_short
            })
        })
        return columns
    }
    handleRowUpdated(e) {
        //merge updated row with current row and rerender by setting state
        console.log(e)
        var rows = this.props.ctx.state.rows;
        Object.assign(rows[e.rowIdx], e.updated);
        this.setState({ rows: rows });
    }
    handleEditRow(table, view, form, key_value) {
        console.log(table, view, form, key_value)
        this.props.ctx.state.table = table
        this.props.ctx.state.view = view
        this.props.ctx.state.form = form
        this.props.ctx.state.key_value = key_value
        //this.props.ctx.handleOpenForm('UPDATE')
    }
    render() {
        let table = this.props.ctx.state.table
        let view = this.props.ctx.state.view
        let form_update = Dico.tables[table].views[view].form_update
        let rubs = Dico.tables[table].rubs
        let cols = Dico.tables[table].views[view].rubs
        let row_key = Dico.tables[table].key
        return (
            <Card>
                <Table ctx={this.props.ctx}
                    table={table} view={view} form_update={form_update}
                    row_key={row_key} rubs={rubs} cols={cols} rows={this.props.ctx.state.rows}
                    onEditRow={this.handleEditRow} />
            </Card>
        )
    }
}

class FormContent extends React.Component {
    constructor(props) {
        super(props);
        //this.handleEditRow = this.handleEditRow.bind(this);
    }

    handleOnChange(key, value) {
        let table = this.props.ctx.state.table
        let form = this.props.ctx.state.form
        let fields = Dico.tables[table].forms[form].rubs
        fields[key].value = value
        //console.log('fields: ' + JSON.stringify(fields, null, 4))        
        this.props.ctx.handleState({})
    }
    handleOnChangeForm(key, value) {
        console.log(Object.keys(this.refs))
        let is_valid = true
        Object.keys(this.refs).forEach((ref) => {
            if (ReactDOM.findDOMNode(this.refs[ref]).classList.contains('is-invalid')) {
                is_valid = false
            }
            console.log(ref + ': ' + is_valid)
        })
        this.props.ctx.handleState({ form_valid: is_valid })
    }

    render() {
        let table = this.props.ctx.state.table
        let form = this.props.ctx.state.form
        let rubs = Dico.tables[table].rubs
        let fields = Dico.tables[table].forms[form].rubs
        let row_key = this.props.ctx.state.row_key
        let key_val = this.props.ctx.state.key_val

        //console.log('fields: ' + JSON.stringify(fields, null, 4))
        return (
            <Card >
                <Form table={table} form={form} row_key={row_key} key_val={key_val} 
                    fields={fields} rubs={rubs}            
                />
            </Card>
        )
    }
}


