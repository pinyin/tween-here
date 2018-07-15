import {existing} from '@pinyin/maybe'
import {nothing} from '@pinyin/types'
import randomcolor from 'randomcolor'
import {CSSProperties, default as React} from 'react'
import {getTweenState} from '../src/getTweenState'
import {tweenHere} from '../src/tweenHere'
import {TweenState} from '../src/TweenState'
import {DemoProps} from './DemoProps'
import {PlayDemo} from './PlayDemo'

export class ResortItems extends React.Component<DemoProps, State, Snapshot> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {
            items: new Array(10).fill(nothing).map((_, i) => ({id: i, color: randomcolor()}))
        }
    }

    getSnapshotBeforeUpdate(): Snapshot {
        const snapshots = new Map<number, TweenState>()
        this.items.forEach((ref, id) =>
            snapshots.set(id, getTweenState(ref))
        )
        return {items: snapshots}
    }

    render() {
        const rootStyle: CSSProperties = {
            position: 'relative',
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            overflow: `hidden`
        }

        const containerStyle: CSSProperties = {
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            WebkitOverflowScrolling: 'touch',
            overflowX: 'hidden',
            overflowY: 'scroll',
            willChange: 'transform',
            overflowAnchor: 'none'
        }

        const contentStyle: CSSProperties = {
            width: `${this.props.width}px`
        }

        const itemStyle = (color: string): CSSProperties => ({
            width: `${this.props.width}px`,
            height: `${this.props.height / 6}px`,
            backgroundColor: `${color}`
        })

        return <div style={rootStyle}>
            <div style={containerStyle}>
                <div style={contentStyle}>{
                    this.state.items.map(({id, color}) =>
                        <div key={id}
                             ref={ref => existing(ref) ? this.items.set(id, ref) : this.items.delete(id)}
                             style={itemStyle(color)}/>
                    )
                }</div>
            </div>
            <PlayDemo onClick={this.onClick}>
                <svg style={{width: 24, height: 24}} viewBox="0 0 24 24">
                    <path fill="#FFFFFF"
                          d="M17,3L22.25,7.5L17,12L22.25,16.5L17,21V18H14.26L11.44,15.18L13.56,13.06L15.5,15H17V12L17,9H15.5L6.5,18H2V15H5.26L14.26,6H17V3M2,6H6.5L9.32,8.82L7.2,10.94L5.26,9H2V6Z"/>
                </svg>
            </PlayDemo>
        </div>
    }

    componentDidUpdate(prevProps: DemoProps, prevState: State, snapshot: Snapshot) {
        this.items.forEach((ref, id) =>
            tweenHere(ref, snapshot.items.get(id), {duration: 300, easing: [0.645, 0.045, 0.355, 1]})
        )
    }

    private items = new Map<number, HTMLDivElement>()

    private onClick = () => {
        const prevItems = this.state.items
        const shuffledItems = prevItems.sort((a, b) => Math.random() > 0.5 ? -1 : 1)
        this.setState({items: shuffledItems})
    }
}

type State = {
    items: Array<{ id: number, color: string }>
}

type Snapshot = {
    items: Map<number, TweenState>
}
