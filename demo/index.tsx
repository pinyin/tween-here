import * as React from 'react'
import {render} from 'react-dom'
import {AnimatedScroll} from './AnimatedScroll'
import {ParentChild} from './ParentChild'
import {ResortItems} from './ResortItems'

const root = document.getElementById("root") as HTMLDivElement

render(<div>
    <div style={{display: 'inline-block'}}>
        <AnimatedScroll width={375} height={667}/>
        <a href={"https://github.com/pinyin/tween-here/blob/master/demo/AnimatedScroll.tsx"}>
            Code
        </a>
    </div>
    <div style={{display: 'inline-block'}}>
        <ResortItems width={375} height={667}/>
        <a href={"https://github.com/pinyin/tween-here/blob/master/demo/ResortItems.tsx"}>
            Code
        </a>
    </div>
    <div style={{display: 'inline-block'}}>,
        <ParentChild width={375} height={667}/>
        <a href={"https://github.com/pinyin/tween-here/blob/master/demo/ParentChild.tsx"}>
            Code
        </a>
    </div>
</div>, root)

