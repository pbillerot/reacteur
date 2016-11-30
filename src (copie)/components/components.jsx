const React = require('react')
const ReactDOM = require('react-dom')

export class IconButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        this.props.onClick(e)
    }
    render() {
        return (
            <a href="javascript:void(0)"
                onClick={this.handleClick}
                title={this.props.title}
                >
                <i className={'material-icons w3-large w3-text-' + this.props.color}>{this.props.icon}</i>
            </a>
        )
    }
}
IconButton.propTypes = {
    title: React.PropTypes.string,
    //color: React.PropTypes.oneOf(['default', 'positive', 'negative', 'warning']),
    color: React.PropTypes.string,
    icon: React.PropTypes.string.isRequired
}
IconButton.defaultProps = {
    color: 'theme',
    title: '',
    icon: null
}

export class Card extends React.Component {
    render() {
        return (
            <div className="w3-container">
                {this.props.children}
            </div>
        )
    }
}

export class Content extends React.Component {
    render() {
        return (
            <div className="w3-main w3-padding-64" style={{ marginLeft: '250px' }}>
                {this.props.children}
            </div>
        )
    }
}

export class Footer extends React.Component {
    render() {
        return (
            <footer className="w3-container w3-theme-l1 w3-bottom" style={{ paddingLeft: '32px' }}>
                {this.props.children}
            </footer>
        )
    }
}

export class Header extends React.Component {
    render() {
        return (
            <div id="myTop" className="w3-top w3-container w3-padding-16 w3-theme-l1 w3-large w3-show-inline-block">
                <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-left w3-margin-right"
                    onClick={(e) => this.props.ctx.handleState({ w3_sidebar_open: true })}
                    ></i>
                <span id="myIntro">{this.props.title}</span>
            </div>
        )
    }
}

export class Nav extends React.Component {
    render() {
        return (
            <a href="javascript:void(0)"
                onClick={(event) => this.props.onClick(this.props.table, this.props.view, event)}
                className={this.props.ctx.state.w3_menu_current == this.props.table + '_' + this.props.view ? 'w3-theme-l4' : ''}
                >{this.props.children}</a>
        )
    }
}

export class Toolbar extends React.Component {
    render() {
        return (
            <div>
                <a className="w3-btn-floating-large w3-theme-action"
                    style={{ position: 'fixed', top: '72px', right: '24px' }}>+</a>
                <ul className="w3-navbar w3-light-grey w3-border" style={{ position: 'fixed', top: '6px', right: '16px' }}>
                    <li><a href="#"><i className="fa fa-search"></i></a></li>
                    <li><a href="#"><i className="fa fa-envelope"></i></a></li>
                    <li><a href="#"><i className="fa fa-globe"></i></a></li>
                    <li><a href="#"><i className="fa fa-sign-in"></i></a></li>
                </ul>
            </div>
        )
    }
}

export class Sidebar extends React.Component {
    render() {
        let w3_sidebar_open = this.props.ctx.state.w3_sidebar_open
        return (
            <div>
                <nav className="w3-sidenav w3-collapse w3-white w3-animate-left w3-card-2"
                    onClick={(e) => this.props.ctx.state.w3_sidebar_open ? this.props.ctx.handleState({ w3_sidebar_open: false }) : {}}
                    style={{ zIndex: 3, width: '250px', display: this.props.ctx.state.w3_sidebar_open ? 'block' : 'none' }} id="mySidenav">
                    <a href="#" className="w3-border-bottom w3-large w3-theme-dark">{this.props.title}</a>
                    {this.props.children}
                </nav >
                {/* Permet de fermer le sidebar en clicquant dans le Content si small screen*/}
                <div className="w3-overlay w3-hide-large w3-animate-opacity"
                    onClick={(e) => this.props.ctx.handleState({ w3_sidebar_open: false })}
                    style={{ cursor: 'pointer', display: this.props.ctx.state.w3_sidebar_open ? 'block' : 'none' }}
                    id="myOverlay"></div>
            </div>
        )
    }
}
export class Window extends React.Component {
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

export class Table extends React.Component {
    render() {
        let table = this.props.table
        let view = this.props.view
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row_key = this.props.row_key
        let irow = 0
        return (
            <table className="w3-table-all w3-hoverable w3-small w3-card-4">
                <thead>
                    <tr className="w3-theme">
                        {
                            Object.keys(cols).map(key =>
                                <th key={key}>{rubs[key].label_short}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.rows.map(row =>
                            <Row key={irow++} row_key={row_key}
                                table={table} view={view} form_update={form_update}
                                row={row} cols={cols} rubs={rubs} onEditRow={this.props.onEditRow} />
                        )
                    }
                </tbody>
            </table>
        )
    }
}

class Row extends React.Component {
    render() {
        let table = this.props.table
        let view = this.props.view
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        //console.log('Row: ',table + '->' + view, row_key + '=' + row[row_key], row)
        let icol = 0
        return (
            <tr>
                {
                    Object.keys(row).map(key =>
                        <Cell key={icol++} row_key={row_key} col_id={key}
                            table={table} view={view} form_update={form_update}
                            row={row} cols={cols} rubs={rubs}
                            onEditRow={this.props.onEditRow}
                            />
                    )
                }
            </tr>
        )
    }
}

class Cell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let table = this.props.table
        let view = this.props.view
        let form_update = this.props.form_update
        let cols = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = row[row_key]
        let key = this.props.col_id
        let val = row[key]
        let rub = rubs[key]
        let col = cols[key]
        //console.log('Cell:', table, view, key+'='+ val)
        switch (rub.type) {
            case 'btn':
                return (
                    <td>
                        <IconButton icon="edit" value="edit" onClick={(e) => this.props.onEditRow(table, view, form_update, key_val)} />
                    </td>
                )
            case 'text':
            default:
                return (
                    <td>{val}</td>
                )
        }
    }
}

class Form extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let table = this.props.table
        let view = this.props.view
        let form = this.props.form
        let fields = this.props.cols
        let rubs = this.props.rubs
        let row = this.props.row
        let row_key = this.props.row_key
        let key_val = this.props.key_val
        return (
            <form>
                {
                    Object.keys(fields).map(key =>
                        <Field key={key} row_key={row_key} field_id={key}
                            row={row} fields={fields} rubs={rubs}
                            onEditRow={this.props.onEditRow}
                            />
                    )
                }
            </form>
        )
    }
}

export class Field extends React.Component {

    handleOnChange(key, value) {
        let table = this.props.ctx.state.table
        let form = this.props.ctx.state.form
        let fields = Dico.tables[table].forms[form].rubs
        fields[key].value = value
        let is_valid = true
        Object.keys(fields).forEach((key) => {
            //console.log(fields[key].ref)
            //console.log(ReactDOM.findDOMNode(fields[key].ref).classList)
            let is_invalid = ReactDOM.findDOMNode(fields[key].ref).classList.contains('is-invalid')
            if (is_invalid) {
                is_valid = false
            }
            //console.log(key + ': ' + !is_invalid)
        })
        this.props.ctx.handleState({ form_valid: is_valid })
    }

    render() {
        let table = this.props.ctx.state.table
        let form = this.props.ctx.state.form
        let rubs = Dico.tables[table].rubs
        let fields = Dico.tables[table].forms[form].rubs
        let key = this.props.key_id

        switch (rubs[key].type) {
            case 'text':
                return (
                    <Textfield floatingLabel {... { label: rubs[key].label_long }}
                        ref={(ref) => fields[key].ref = this}
                        {... { pattern: rubs[key].pattern }}
                        {... { error: rubs[key].error }}
                        {... { required: rubs[key].required }}
                        {... { maxLength: rubs[key].length }}
                        value={fields[key].value}
                        onChange={(event) => this.handleOnChange(key, event.target.value)} />
                )
            case 'email':
                return (
                    <Textfield floatingLabel {... { label: rubs[key].label_long }}
                        ref={(ref) => fields[key].ref = this}
                        {... { pattern: "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", }}
                        {... { error: "l'email sera de la forme: name@info.net" }}
                        {... { required: rubs[key].required }}
                        {... { maxLength: rubs[key].length }}
                        value={fields[key].value}
                        onChange={(event) => this.handleOnChange(key, event.target.value)} />
                )
            case 'button':
                return (
                    <IconButton name="edit" />
                )
            default:
                return <div>{key}.type {rubs[key].type}not found</div>
        }
    }

}