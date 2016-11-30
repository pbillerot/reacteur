const React = require('react')
const ReactDOM = require('react-dom')
const {Button, Card, Content, Footer, Header, IconButton, Menubar, Nav, Navbar, NavGroup, Toolbar, Sidebar, Window} = require('./components.jsx')

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // W3
            w3_menu_current: null,
            w3_sidebar_open: false
        }
        //this.handleMenu = this.handleMenu.bind(this);
    }
    handleMenu(action, menu_id) {
        //console.log(action, menu_id)
        switch (action) {
            case 'open':
                if (menu_id != null) {
                    this.state.w3_menu_current = menu_id
                }
                this.state.w3_sidebar_open = true
                break;
            case 'close':
                this.state.w3_sidebar_open = false
                break;
            default:
                this.state.w3_sidebar_open = true
                break;
        }
        this.setState({})
    }

    render() {
        return (
            <Window>
                <Sidebar title="ATOMIUM" ctx={this}>
                    <Nav id="m1" ctx={this}>LISTE DES COMPTES UTILISATEURS</Nav>
                    <Nav id="m2" ctx={this}>LISTE DES COMMANDES</Nav>
                </Sidebar>

                <Content ctx={this}>
                    <Header ctx={this} />
                    <Contenu />
                    <Table />
                    <Contenu />
                    <Footer ctx={this}>
                        <h5>Footer</h5>
                        <p>Footer information goes here</p>
                    </Footer>
                </Content>
            </Window>
        )

    }
}

class Contenu extends React.Component {
    render() {
        return (
            <div className="w3-container w3-padding-32" style={{ paddingLeft: '32px' }}>
                <h2>What is W3.CSS?</h2>
                <p>W3.CSS is a modern CSS framework with built-in responsiveness:</p>

                <ul className="w3-leftbar w3-theme-border" style={{ listStyle: 'none' }}>
                    <li>Smaller and faster than other CSS frameworks.</li>
                    <li>Easier to learn, and easier to use than other CSS frameworks.</li>
                    <li>Uses standard CSS only (No jQuery or JavaScript library).</li>
                    <li>Speeds up mobile HTML apps.</li>
                    <li>Provides CSS equality for all devices. PC, laptop, tablet, and mobile:</li>
                </ul>
            </div>
        )
    }
}

class Table extends React.Component {
    render() {
        return (
            <div className="w3-container">
                <h2>Table All</h2>
                <p>The w3-table-all class combines the w3-table, w3-bordered, w3-striped, and
  w3-border classes:</p>

                <table className="w3-table-all">
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Points</th>
                    </tr>
                    <tr>
                        <td>Jill</td>
                        <td>Smith</td>
                        <td>50</td>
                    </tr>
                    <tr>
                        <td>Eve</td>
                        <td>Jackson</td>
                        <td>94</td>
                    </tr>
                    <tr>
                        <td>Adam</td>
                        <td>Johnson</td>
                        <td>67</td>
                    </tr>
                    <tr>
                        <td>Bo</td>
                        <td>Nilson</td>
                        <td>35</td>
                    </tr>
                </table>
            </div>
        )
    }
}
