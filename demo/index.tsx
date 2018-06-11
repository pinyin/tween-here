import * as React from 'react'
import {render} from 'react-dom'
import {AnimatedScroll} from './AnimatedScroll'
import {ParentChild} from './ParentChild'
import {ResortItems} from './ResortItems'

const root = document.getElementById("root") as HTMLDivElement

render(<div>
    <div style={{display: 'inline-block'}}><AnimatedScroll width={375} height={667}/></div>
    <div style={{display: 'inline-block'}}><ResortItems width={375} height={667}/></div>
    <div style={{display: 'inline-block'}}><ParentChild width={375} height={667}/></div>
</div>, root)

