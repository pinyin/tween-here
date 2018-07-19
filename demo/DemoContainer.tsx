import * as React from 'react'
import {CSSProperties} from 'react'

export class DemoContainer extends React.Component {
    render() {
        const rootStyle: CSSProperties = {
            position: 'relative',
            width: `375px`,
            height: `667px`,
            overflow: `hidden`,
            backgroundColor: 'aliceblue',
        }

        return <div style={rootStyle}>
            {this.props.children}
        </div>
    }
}

