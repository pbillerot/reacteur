import React from 'react';
const fs = require('fs')
var Markdown = require('react-markdown-it')

class RestHelp extends React.Component {
    render() {
        let data = fs.readFileSync(__dirname + '/help.md', 'utf8')
        console.log('Markdown: ', data)
        return (
            <Card style={{ width: '100%', margin: 'auto' }}>
                <CardText>
                    <ReactMarkdown source={data} />
                </CardText>
            </Card>
        )
    }
}
