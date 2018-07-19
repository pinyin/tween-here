import {notExisting} from '@pinyin/maybe'
import {nothing} from '@pinyin/types'
import randomcolor from 'randomcolor'
import * as React from 'react'
import {CSSProperties} from 'react'
import {getTweenState} from '../src/getTweenState'
import {tweenHere} from '../src/tweenHere'
import {DemoProps} from './DemoProps'
import {PlayDemo} from './PlayDemo'

export class AnimatedScroll extends React.Component<DemoProps> {
    render() {
        const rootStyle: CSSProperties = {
            position: 'relative',
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            overflow: `hidden`,
            willChange: 'transform',
        }

        const containerStyle: CSSProperties = {
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            WebkitOverflowScrolling: 'touch',
            overflowX: 'hidden',
            overflowY: 'scroll',
            willChange: 'transform'
        }

        const contentStyle: CSSProperties = {
            width: `${this.props.width}px`
        }

        const itemStyle = (): CSSProperties => ({
            width: `${this.props.width}px`,
            height: `${this.props.height / 6}px`,
            backgroundColor: `${randomcolor({luminosity: 'light'})}`,
        })

        return <div style={rootStyle}>
            <div style={containerStyle} ref={this.container}>
                <div style={contentStyle} ref={this.content}>{
                    new Array(100).fill(nothing).map((_, i) =>
                        <div key={i} style={itemStyle()}/>
                    )
                }</div>
            </div>
            <PlayDemo onClick={this.onClick}>
                <svg style={{width: 24, height: 24}} viewBox="0 0 24 24">
                    <path fill="#FFFFFF" d="M9,3L5,7H8V14H10V7H13M16,17V10H14V17H11L15,21L19,17H16Z"/>
                </svg>
            </PlayDemo>
        </div>
    }

    private container = React.createRef<HTMLDivElement>()
    private content = React.createRef<HTMLDivElement>()

    private onClick = () => {
        const container = this.container.current
        const content = this.content.current

        if (notExisting(container) || notExisting(content)) {
            throw new Error("No scroll target")
        }

        const snapshot = getTweenState(content)
        container.scrollTop = Math.random() * (content.clientHeight - container.clientHeight)
        tweenHere(content, snapshot, {
            duration: (from, to) => Math.abs(from.y - to.y) / 5,
            easing: [0.645, 0.045, 0.355, 1],
        })
    }
}
