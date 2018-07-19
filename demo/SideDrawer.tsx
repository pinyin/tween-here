import {assume} from '@pinyin/maybe'
import {nothing} from '@pinyin/types'
import randomcolor from 'randomcolor'
import * as React from 'react'
import {CSSProperties} from 'react'
import {calcTransformCSS} from '../src/calcTransformCSS'
import {calcTransitionCSS} from '../src/calcTransitionCSS'
import {getTweenState} from '../src/getTweenState'
import {tweenExit} from '../src/tweenExit'
import {tweenHere} from '../src/tweenHere'
import {TweenState} from '../src/TweenState'
import {DemoContainer} from './DemoContainer'
import {DemoProps} from './DemoProps'
import {PlayDemo} from './PlayDemo'

export class SideDrawer extends React.Component<DemoProps, State> {
    getSnapshotBeforeUpdate() {
        if (this.btn.current) {
            const ref = this.btn.current
            tweenExit(ref, from => ({...from, opacity: 0}))
        }
        const container = assume(this.container.current, ref => getTweenState(ref))
        return {container}
    }

    componentDidUpdate(prevProps: Readonly<DemoProps>, prevState: Readonly<State>, snapshot: Snapshot): void {
        if (this.container.current) {
            const ref = this.container.current
            tweenHere(ref, snapshot.container, {duration: 400, easing: [0.645, 0.045, 0.355, 1]})
        }
    }

    render() {
        const {width, height} = this.props
        const containerStyle: CSSProperties = {
            ...{
                position: `absolute`,
                width: `${width}px`,
                height: `${height}px`,
                WebkitOverflowScrolling: 'touch',
                overflowX: 'hidden',
                overflowY: 'scroll',
                willChange: 'transform',
                filter: `drop-shadow(0px 0px 4px grey)`,
                zIndex: 10,
            },
            ...this.state.opening ?
                {
                    transform: calcTransformCSS(
                        {x: 0, y: 0, width: width, height: height},
                        {x: width * (3 / 4), y: height * (1 / 8), width: width * (3 / 4), height: height * (3 / 4)},
                    ),
                    transition: calcTransitionCSS(400, [0.645, 0.045, 0.355, 1]),
                } :
                {
                    width: `${width}px`,
                    height: `${height}px`,
                },
        }

        const contentStyle: CSSProperties = {
            width: `${width}px`,
        }

        const itemStyle = (color: string): CSSProperties => ({
            width: `${width}px`,
            height: `${height / 6}px`,
            backgroundColor: `${color}`,
        })

        const menuStyle: CSSProperties = {
            ...{
                position: 'absolute',
                top: 0,
                left: 0,
                width: width * 1 / 2,
                height: height,
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            },
            ...this.state.opening ?
                {
                    transform: 'none',
                    transition: calcTransitionCSS(400, [0.645, 0.045, 0.355, 1]),
                } :
                {
                    transform: calcTransformCSS(
                        {x: 0, y: 0, width: width * 1 / 2, height: height},
                        {x: -width / 2, y: 0, width: width * 1 / 2, height: height},
                    ),
                    transition: calcTransitionCSS(400, [0.645, 0.045, 0.355, 1]),
                },
        }

        const menuItemStyle = (color: string): CSSProperties => ({
            width: '80%',
            height: 64,
            backgroundColor: color,
        })

        return <DemoContainer>
            <div style={containerStyle} ref={this.container} onClick={() => this.setState({opening: false})}>
                <div style={contentStyle} ref={this.content}>{
                    this.colors.map((color, i) =>
                        <div key={i} style={itemStyle(color)}/>,
                    )
                }</div>
            </div>
            <div style={menuStyle}>
                {this.menuColors.map((color, i) =>
                    <div key={i} style={menuItemStyle(color)}/>,
                )}
            </div>
            <PlayDemo onClick={this.onClick} style={{top: 24, left: 24, zIndex: 20}}>
                {this.state.opening ?
                    <svg key={this.state.opening.toString()} ref={this.btn}
                         style={{width: 24, height: 24}} viewBox="0 0 24 24">
                        <path fill="#000000"
                              d="M5,13L9,17L7.6,18.42L1.18,12L7.6,5.58L9,7L5,11H21V13H5M21,6V8H11V6H21M21,16V18H11V16H21Z"/>
                    </svg> :
                    <svg key={this.state.opening.toString()} ref={this.btn}
                         style={{width: 24, height: 24}} viewBox="0 0 24 24">
                        <path fill="#000000" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
                    </svg>
                }
            </PlayDemo>
        </DemoContainer>
    }

    state = {opening: false}
    private container = React.createRef<HTMLDivElement>()
    private content = React.createRef<HTMLDivElement>()
    private btn = React.createRef<SVGSVGElement>()

    private colors = new Array(100).fill(nothing).map((_, i) =>
        randomcolor({luminosity: 'light'}),
    )
    private menuColors = new Array(6).fill(nothing).map((_, i) =>
        randomcolor({luminosity: 'light'}),
    )

    private onClick = () => {
        this.setState({opening: !this.state.opening})
    }
}

type State = {
    opening: boolean
}

type Snapshot = {
    container?: TweenState
}
