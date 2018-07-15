import {assume, Maybe} from '@pinyin/maybe'
import {nothing} from '@pinyin/types'
import randomcolor from 'randomcolor'
import {CSSProperties, default as React} from 'react'
import {getTweenState} from '../src/getTweenState'
import {tweenExit} from '../src/tweenExit'
import {tweenHere} from '../src/tweenHere'
import {TweenState} from '../src/TweenState'
import {DemoProps} from './DemoProps'

export class ParentChild extends React.Component<DemoProps, State, Snapshot> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {opening: false}
    }

    getSnapshotBeforeUpdate(): Snapshot {
        const item = assume(this.item.current, ref => getTweenState(ref))
        assume(this.container.current, ref =>
            tweenExit(ref, from => ({...from, opacity: 0}), {duration: 300}),
        )
        assume(this.childText.current, ref =>
            this.childTextSnapshot = getTweenState(ref),
        )
        assume(this.pageText.current, ref =>
            this.pageTextSnapshot = getTweenState(ref),
        )

        return {item}
    }

    render() {
        const rootStyle = {
            position: 'relative',
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            overflow: `hidden`,
        } as CSSProperties

        const containerStyle = {
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            WebkitOverflowScrolling: 'touch',
            overflowX: 'hidden',
            overflowY: 'scroll',
            willChange: 'transform',
            overflowAnchor: 'none',
        } as CSSProperties

        const contentStyle = {
            width: `${this.props.width}px`,
        }

        const itemStyle = (color: string) => ({
            width: `${this.props.width}px`,
            height: `${this.props.height / 6}px`,
            backgroundColor: `${color}`,
            textAlign: 'center',
        } as CSSProperties)

        const openedItemStyle = {
            width: this.props.width,
            height: this.props.height,
            backgroundColor: 'black',
            textAlign: 'center',
        } as CSSProperties

        const textStyle = (isLarge: boolean): CSSProperties => ({
            display: 'inline-block',
            fontFamily: 'sans-serif',
            fontSize: isLarge ? 40 : 20,
            color: 'white',
        })

        return <div style={rootStyle}>
            {this.state.opening ?
                // must provide key or this div will be reused unexpectedly
                <div key={'page'} ref={this.item} style={openedItemStyle} onClick={this.onClick}>
                    <p ref={this.pageText} style={textStyle(true)}> Click to Close Page </p>
                </div> :
                <div key={'container'} ref={this.container} style={containerStyle}>
                    <div style={contentStyle}>{
                        this.items.map(({id, color}) =>
                            id === 3 ?
                                <div key={id}
                                     ref={this.item}
                                     style={itemStyle('black')}
                                     onClick={this.onClick}
                                >
                                    <p ref={this.childText} style={textStyle(false)}>
                                        Click to Open Item
                                    </p>
                                </div> :
                                <div key={id} style={itemStyle(color)}/>,
                        )
                    }</div>
                </div>
            }
        </div>
    }

    componentDidUpdate(prevProps: DemoProps, prevState: State, snapshot: Snapshot) {
        assume(this.childText.current, ref =>
            tweenHere(ref, this.pageTextSnapshot, {duration: 400, easing: [0.645, 0.045, 0.355, 1]}),
        )
        assume(this.pageText.current, ref =>
            tweenHere(ref, this.childTextSnapshot, {duration: 400, easing: [0.645, 0.045, 0.355, 1]}),
        )
        assume(this.item.current, ref =>
            tweenHere(ref, snapshot.item, {duration: 400, easing: [0.645, 0.045, 0.355, 1]}),
        )
    }

    private childText = React.createRef<HTMLParagraphElement>()
    private childTextSnapshot: Maybe<TweenState>
    private pageText = React.createRef<HTMLParagraphElement>()
    private pageTextSnapshot: Maybe<TweenState>

    private container = React.createRef<HTMLDivElement>()
    private item = React.createRef<HTMLDivElement>()
    private items = new Array(10)
        .fill(nothing)
        .map((_, id) => ({id, color: randomcolor()}))

    private onClick = () => {
        this.setState(state => ({opening: !state.opening}))
    }
}

type State = {
    opening: boolean
}

type Snapshot = {
    item: Maybe<TweenState>
}
