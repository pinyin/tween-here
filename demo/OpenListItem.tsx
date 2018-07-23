import {assume, Maybe} from '@pinyin/maybe'
import {nothing} from '@pinyin/types'
import randomcolor from 'randomcolor'
import {CSSProperties, default as React} from 'react'
import {getTweenState} from '../src/getTweenState'
import {tweenExit} from '../src/tweenExit'
import {tweenHere} from '../src/tweenHere'
import {TweenState} from '../src/TweenState'
import {DemoContainer} from './DemoContainer'
import {DemoProps} from './DemoProps'

export class OpenListItem extends React.Component<DemoProps, State, Snapshot> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {opening: false}
    }

    getSnapshotBeforeUpdate(): Snapshot {
        const item = assume(this.item.current, ref => getTweenState(ref))
        const text = assume(this.text.current, ref => getTweenState(ref))
        if (this.list.current) {
            const ref = this.list.current
            tweenExit(ref, from => ({...from, opacity: 0}), {duration: 300})
            this.scrollTop = ref.scrollTop
        }
        if (this.item.current) {
            const ref = this.item.current
            tweenExit(ref, from => ({...from, opacity: 0}), {duration: 300})
        }

        return {item, text}
    }

    render() {
        const listStyle: CSSProperties = {
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            WebkitOverflowScrolling: 'touch',
            overflowX: 'hidden',
            overflowY: 'auto',
            willChange: 'transform',
            overflowAnchor: 'none',
            zIndex: 9,
        }

        const listItemStyle: CSSProperties = {
            width: `${this.props.width}px`,
        }

        const itemStyle = (color: string): CSSProperties => ({
            width: `${this.props.width}px`,
            height: `${this.props.height / 6}px`,
            backgroundColor: `${color}`,
            willChange: 'transform, opacity',
            textAlign: 'center',
        })

        const openedItemStyle: CSSProperties = {
            width: this.props.width,
            height: this.props.height,
            backgroundColor: 'aliceblue',
            textAlign: 'center',
            willChange: 'transform, opacity',
            zIndex: 10,
        }

        return <DemoContainer>
            {this.state.opening ?
                // must provide key or this div will be reused unexpectedly
                <div key={'page'} ref={this.item} style={openedItemStyle} onClick={this.onClick}>
                    <svg ref={this.text} style={{width: 96, height: 96}} viewBox="0 0 24 24">
                        <path fill="#000000"
                              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </div> :
                <div key={'list'} ref={this.list} style={listStyle}>
                    <div style={listItemStyle}>{
                        this.items.map(({id, color}) =>
                            id === 4 ?
                                <div key={id}
                                     ref={this.item}
                                     style={itemStyle('aliceblue')}
                                     onClick={this.onClick}
                                >
                                    <svg ref={this.text} style={{
                                        width: 48,
                                        height: 48,
                                        willChange: 'transform, opacity',
                                    }} viewBox="0 0 24 24">
                                        <path fill="#000000"
                                              d="M10,9A1,1 0 0,1 11,8A1,1 0 0,1 12,9V13.47L13.21,13.6L18.15,15.79C18.68,16.03 19,16.56 19,17.14V21.5C18.97,22.32 18.32,22.97 17.5,23H11C10.62,23 10.26,22.85 10,22.57L5.1,18.37L5.84,17.6C6.03,17.39 6.3,17.28 6.58,17.28H6.8L10,19V9M11,5A4,4 0 0,1 15,9C15,10.5 14.2,11.77 13,12.46V11.24C13.61,10.69 14,9.89 14,9A3,3 0 0,0 11,6A3,3 0 0,0 8,9C8,9.89 8.39,10.69 9,11.24V12.46C7.8,11.77 7,10.5 7,9A4,4 0 0,1 11,5Z"/>
                                    </svg>
                                </div> :
                                <div key={id} style={itemStyle(color)}/>,
                        )
                    }</div>
                </div>
            }
        </DemoContainer>
    }

    componentDidUpdate(prevProps: DemoProps, prevState: State, snapshot: Snapshot) {
        if (this.text.current) {
            const ref = this.text.current
            tweenHere(ref, snapshot.text, {duration: 400, easing: [0.645, 0.045, 0.355, 1]})
        }
        if (this.item.current) {
            const ref = this.item.current
            tweenHere(ref, snapshot.item, {duration: 400, easing: [0.645, 0.045, 0.355, 1]})
        }
        if (this.list.current) {
            const ref = this.list.current
            ref.scrollTop = this.scrollTop
        }
    }

    private list = React.createRef<HTMLDivElement>()
    private item = React.createRef<HTMLDivElement>()
    private text = React.createRef<SVGSVGElement>()
    private items = new Array(10)
        .fill(nothing)
        .map((_, id) => ({id, color: randomcolor({luminosity: 'light'})}))
    private scrollTop = 0

    private onClick = () => {
        this.setState(state => ({opening: !state.opening}))
    }
}

type State = {
    opening: boolean
}

type Snapshot = {
    item: Maybe<TweenState>
    text: Maybe<TweenState>
}
