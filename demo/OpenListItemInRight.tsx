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

export class OpenListItemInRight extends React.Component<DemoProps, State, Snapshot> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {opening: false}
    }

    getSnapshotBeforeUpdate(): Snapshot {
        const item = assume(this.item.current, ref => getTweenState(ref))
        const text = assume(this.text.current, ref => getTweenState(ref))
        if (this.list.current) {
            const ref = this.list.current
            this.scrollTop = ref.scrollTop
            tweenExit(ref, from => ({...from, x: from.x - from.width, opacity: 0}), {duration: 300})
        }
        if (this.item.current) {
            const ref = this.item.current
            tweenExit(ref, from => ({...from, opacity: 0}), {duration: 300}).catch(e => {}) // TODO
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
            textAlign: 'center',
        })

        const openedItemStyle: CSSProperties = {
            width: this.props.width,
            height: this.props.height,
            backgroundColor: 'aliceblue',
            textAlign: 'center',
            zIndex: 10,
        }

        const textStyle = (isLarge: boolean): CSSProperties => ({
            display: 'inline-block',
            fontFamily: 'sans-serif',
            fontSize: isLarge ? 40 : 20,
            color: 'black',
        })

        return <DemoContainer>
            {this.state.opening ?
                // must provide key or this div will be reused unexpectedly
                <div key={'page'} ref={this.item} style={openedItemStyle} onClick={this.onClick}>
                    <p ref={this.text} style={textStyle(true)}> Click to Close Page </p>
                </div> :
                <div key={'list'} ref={this.list} style={listStyle}>
                    <div style={listItemStyle}>{
                        this.items.map(({id, color}) =>
                            id === 5 ?
                                <div key={id}
                                     ref={this.item}
                                     style={itemStyle('aliceblue')}
                                     onClick={this.onClick}
                                >
                                    <p ref={this.text} style={textStyle(false)}>
                                        Click to Open Item
                                    </p>
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
        if (prevState.opening && !this.state.opening) {
            if (this.list.current) {
                const ref = this.list.current
                tweenHere(ref, snapshot => ({...snapshot, x: snapshot.x - snapshot.width}), {
                    duration: 400,
                    easing: [0.645, 0.045, 0.355, 1],
                })
                ref.scrollTop = this.scrollTop
            }
        }
    }

    private list = React.createRef<HTMLDivElement>()
    private item = React.createRef<HTMLDivElement>()
    private text = React.createRef<HTMLParagraphElement>()
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
