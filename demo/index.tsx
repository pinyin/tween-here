import * as React from 'react'
import {render} from 'react-dom'
import {AnimatedScroll} from './AnimatedScroll'
import {OpenListItem} from './OpenListItem'
import {OpenListItemInRight} from './OpenListItemInRight'
import {ResortItems} from './ResortItems'
import {SideDrawer} from './SideDrawer'

const root = document.getElementById("root") as HTMLDivElement

render(<div>
    <div style={{display: 'inline-block'}}>
        <AnimatedScroll width={375} height={667}/>
    </div>
    <div style={{display: 'inline-block'}}>
        <ResortItems width={375} height={667}/>
    </div>
    <div style={{display: 'inline-block'}}>
        <OpenListItem width={375} height={667}/>
    </div>
    <div style={{display: 'inline-block'}}>
        <OpenListItemInRight width={375} height={667}/>
    </div>
    <div style={{display: 'inline-block'}}>
        <SideDrawer width={375} height={667}/>
    </div>
    <a href={'https://github.com/pinyin/tween-here/blob/master/demo'}>
        Source Code
    </a>
</div>, root)

