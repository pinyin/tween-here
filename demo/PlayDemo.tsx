import * as React from 'react'
import {CSSProperties} from 'react'

export class PlayDemo extends React.Component<Props> {
    render() {
        const buttonStyle = {
            position: `absolute`,
            right: 24,
            bottom: 24,
            width: 56,
            height: 56
        } as CSSProperties

        const circleStyle = {
            position: 'absolute',
            width: 56,
            height: 56
        } as CSSProperties

        const iconStyle = {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%)`
        } as CSSProperties

        return <div style={buttonStyle} onClick={this.props.onClick}>
            <svg style={circleStyle} viewBox="0 0 24 24">
                <path fill="#000000" d='M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'/>
            </svg>
            <div style={iconStyle}>
                {this.props.children}
            </div>
        </div>
    }
}

type Props = {
    onClick?: () => void
}
