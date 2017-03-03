const React = require('react')
const ReactDOM = require('react-dom')
import Alert from 'react-s-alert';

export class Alerter extends React.Component {
    constructor(props) {
        super(props);
        this.handleOnClose = this.handleOnClose.bind(this);
    }
    handleOnClose(e) {
        //e.preventDefault();
        fetch('/api/alerter_raz', { credentials: 'same-origin' })
            .then(response => {
                response.json().then(json => {
                    // raf
                })
            })

    }
    render() {
        return (
            <Alert stack={{ limit: 3, spacing: 10 }}
                offset={70}
                onClose={this.handleOnClose}
                />
        )
    }
}

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
    icon: 'edit'
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
                <i className="fa fa-bars w3-opennav w3-hide-large w3-xlarge w3-margin-right"
                    onClick={(e) => this.props.page.handlerCtx({ w3_sidebar_open: true })}
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
                className={this.props.apex.state.w3_menu_current == this.props.table + '_' + this.props.view ? 'w3-theme-l4' : ''}
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
        let w3_sidebar_open = this.props.apex.state.w3_sidebar_open
        return (
            <div>
                <nav className="w3-sidenav w3-collapse w3-white w3-animate-left w3-card-2"
                    onClick={(e) => this.props.apex.state.w3_sidebar_open ? this.props.apex.handleState({ w3_sidebar_open: false }) : {}}
                    style={{ zIndex: 3, width: '250px', display: this.props.apex.state.w3_sidebar_open ? 'block' : 'none' }} id="mySidenav">
                    <Link href="/" className="w3-border-bottom w3-large w3-theme-dark">{this.props.title}</Link>
                    {this.props.children}
                </nav >
                {/* Permet de fermer le sidebar en clicquant dans le Content si small screen*/}
                <div className="w3-overlay w3-hide-large w3-animate-opacity"
                    onClick={(e) => this.props.apex.handleState({ w3_sidebar_open: false })}
                    style={{ cursor: 'pointer', display: this.props.apex.state.w3_sidebar_open ? 'block' : 'none' }}
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
