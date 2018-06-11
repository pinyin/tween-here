import * as React from 'react'
import {render} from 'react-dom'
import {AnimatedScroll} from './AnimatedScroll'

const root = document.getElementById("root") as HTMLDivElement

render(<AnimatedScroll width={375} height={667}/>, root)

