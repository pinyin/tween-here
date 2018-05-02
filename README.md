# tween-here

The animation library to use when you don't really care about animations.

------

## Install

`npm install --save @pinyin/tween-here`

It should support TypeScript out of the box. If not, please submit an issue.

## Usage

```typescript jsx
import {tweenHere, tweenExit, getTweenState} from '@pinyin/tween-here'

// Get a reference to the animation target 
// For React, you may want to use refs(https://reactjs.org/docs/refs-and-the-dom.html)
const element: Element = document.getElementById("")

// Make it fade in smoothly
// For React, this line may be placed in componentDidMount()
tweenHere(element, snapshot=> ({...snapshot, opacity: 0}))

// Tweening from one place to another
// 1. snapshot current position before element is moved
// For React, this line may be in componentWillUpdate() or getSnapshotBeforeUpdate()
const snapshot = getTweenState(element)
// 2. when element is moved, call tweenHere on the snapshot
tweenHere(element, snapshot)

// When this element is detached from dom, make it fade out instead of suddenly disappear.
// For React, this may appear in componentWillUpdate(), getSnapshotBeforeUpdate() or componentWillUnmount()
// Yes, you can specify a component's unmount animation inside the component itself.
tweenExit(element, snapshot=>({...snapshot, opacity: 0}))

```

Demo is planned. For now, please refer to this [InfiniteList component demo](http://pinyin.github.io/InfiniteMasonry/InfiniteMasonry.html) to see this library in action. 

All animations in the current demo are implemented with this library.

## Design Target

[Motions are important](https://material.io/guidelines/motion/material-motion.html#material-motion-why-does-motion-matter).

But they are hard to implement.

We've had many web animation solutions that are both precise and powerful, like [Popmotion](https://popmotion.io/) and [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and may other awesome ones, but sometimes, even these precise solutions seem to be a little too much for the simple use case.

> Just make this element appear smoothly, please. It should be simple.

That's what `tween-here` is designed for. It does aim to be a complete animating library, but you should be able to implement most UI motions (like the ones from [Material Design](https://material.io/guidelines/motion/material-motion.html)) with this library.


## APIs

The document is not complete yet. Any contributions are welcome.

`tween-here` comes with two functions, `tweenHere` and `tweenExit`, each function provides a fast way to implement a kind of motions. 

```typescript jsx
async function tweenHere(
    element: HTMLElement,
    from: Maybe<TweenState> | ((snapshot: TweenState, to: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1]
): Promise<void> 

async function tweenExit(
    element: HTMLElement,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1]
): Promise<void> 
```

In general, use `tweenHere` when you want an element to move smoothly, use `tweenExit` when you know an element is being detached from `document` and want it to disappear smoothly.

TweenState is an object representing the position of an element (relative to viewport):
```typescript jsx
type TweenState = {
    x: number
    y: number
    width: number
    height: number
    opacity: number
} 
```
In practise, you may get these numbers by using `getBoundingClientRect()` and other native APIs. 

For convenience, this library provides two helper functions, `getTweenState` and `getOriginalTweenState`, to capture the `TweenState` of an existing element. 

```typescript jsx
getTweenState(element: HTMLElement): TweenState
getOriginalTweenState(element: HTMLElement): TweenState
```

By using these helper functions and `tweenHere`, you can easily make an element tween smoothly from the position of another element, constructing a visual effect of they are the same element.


## Notice

This library is very unstable yet, any contributions(code, issue, use cases proposal...) are welcome.

## License

MIT


