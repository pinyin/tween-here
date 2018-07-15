# TweenHere

[![Build Status](https://travis-ci.org/pinyin/tween-here.svg?branch=master)](https://travis-ci.org/pinyin/tween-here)

A UI animation library designed for modern JS frameworks.

[打开中文Readme](./README.cn.md)

## Install

`npm install --save tween-here`

It should support TypeScript out of the box. If not, please submit an issue.

## Usage

[Open Demo (better for large screen)](http://pinyin.github.io/tween-here)

TweenHere is designed for UI animations. 

For example, if you want to change the scroll position of a scroll container:

```html
<div style="overflow-y: scroll"> // scroll container element
    <div id="content"> // content element
    // ... elements
    </div>
</div>
```
To adjust its scroll position, you will:
```
container.scrollTop = 100
```
Content will then jump to a new position. What if you want it to move smoothly? 

With TweenHere, you can add an animation within three lines:
```
const content = document.getElementById('element')
const snapshot = getTweenState(content) // get position of scrolled content
container.scrollTop = 100
tweenHere(content, snapshot) // content will move to its new position smoothly 
```

... and you can achieve a surprising number of effects with this simple API.

All animations are implemented with [FLIP technique](https://aerotwist.com/blog/flip-your-animations/), so the performance should be relatively good.

## Design Target

[Motions are important](https://material.io/guidelines/motion/material-motion.html#material-motion-why-does-motion-matter).

But they are hard to implement.

We've already had many web animation solutions that are both precise and powerful, like [Popmotion](https://popmotion.io/) and [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and many other awesome ones, but sometimes, even these precise solutions seem to be too much work compared to the simple use case.

> "Just make this element appear smoothly, please. It should be simple."  - your product manager

That's what `TweenHere` is designed for: UI animations. It does not aim to be a library that enables any animation, but you should be able to implement most UI motions (like the ones from [Material Design](https://material.io/guidelines/motion/material-motion.html)) with this library.

With `TweenHere`, instead of specifying a start state and a end state, an animation is regarded as "how an element comes to its current state", so it should work with most JS frameworks: as long as you can get the reference to a DOM node, you can animate it.

## APIs

`TweenHere` comes with two functions, `tweenHere` and `tweenExit`, each function provides a fast way to implement a kind of motions. 

```typescript jsx

async function tweenHere(
    element: HTMLElement,
    from: TweenState | ((snapshot: TweenState, to: TweenState) => TweenState),
    params?: {
        duration?: number | ((from: TweenState, to: TweenState) => number),
        easing?: [number, number, number, number]
    }
): Promise<void> 

async function tweenExit(
    element: HTMLElement,
    to: TweenState | ((from: TweenState) => TweenState),
    params?: {
        duration?: number | ((from: TweenState, to: TweenState) => number),
        easing?: [number, number, number, number],
        container?: Element 
    }
): Promise<void> 
```

For both function, only the first two params are necessary.

TweenState is an object representing the properties of an element (relative to viewport):
```typescript jsx
type TweenState = {
    x: number
    y: number
    width: number
    height: number
    opacity: number
} 
```
You can get these numbers manually with `getBoundingClientRect()` and other native APIs. 

For convenience, this library provides a helper function, `getTweenState`, to construct a `TweenState` from an existing element. 

```typescript jsx
getTweenState(element: HTMLElement): TweenState
```

[By passing the return value from this helper function to `tweenHere`](./demo/ParentChild.tsx), you can easily make an element appear smoothly from the position of another element, constructing a visual effect that they are the same element.

In general, use `tweenHere` when you want an element to move to its current state smoothly, use `tweenExit` on an element when you know the element will be detached from document and want it to disappear smoothly.

## Limits

The animated element's `transform` `opacity` and `transition` style properties are not preserved.

`tweenExit` adds node to the DOM structure while tweening, so it may not be capable with some CSS styles.

This library is still at its early stage, please report an issue if you notice any undesired behavior.

Requires `WeakMap`, `Set` and `MutationObserver` to be present in runtime. Polyfills are ok.

## Plans

Add document.

Support rotation.

Add more [demos](http://pinyin.github.io/tween-here).

Add bindings for React/Angular/Vue.

## Similar Projects & Articles

[FLIP Technique](https://aerotwist.com/blog/flip-your-animations/)

[react-flip-move](https://github.com/joshwcomeau/react-flip-move)

[Flipping](https://github.com/davidkpiano/flipping)

[react-flip-toolkit](https://github.com/aholachek/react-flip-toolkit)

## License

MIT

All contributions are welcome.
