'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            w3_sidebar_open: false
        }
    }
    
    getChildContext() {
        return {
            w3_sidebar_open: this.state.w3_sidebar_open
        }
    }
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}
Layout.childContextTypes = {
        w3_sidebar_open: React.PropTypes.bool
}

