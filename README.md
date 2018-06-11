# TweenHere

A UI animation library designed for modern JS frameworks.

## Install

`npm install --save @pinyin/tween-here`

It should support TypeScript out of the box. If not, please submit an issue.

## Usage

[Demo (need large screen)](http://pinyin.github.io/tween-here)

TweenHere is designed for UI animations. 

For example, if you want to change the scroll position of a scroll container:

```html
<div style="overflow-y: scroll"> // scroll container element
    <div> // content element
    // ... elements
    </div>
</div>
```
To adjust its scroll position, you will:
```
container.scrollTop = 100
```
Content will jump to a new position. What if you want it to move smoothly? 

With TweenHere, you can add an animation within two lines:
```
const snapshot = getTweenState(content) // get position of scrolled content
container.scrollTop = 100
tweenHere(content, snapshot) // content will move to its new position smoothly 
```

... and you can achieve a surprising number of effects with this simple API.

All animations are implemented with [FLIP technique](https://aerotwist.com/blog/flip-your-animations/), so the performance should be relatively good.

## Design Target

[Motions are important](https://material.io/guidelines/motion/material-motion.html#material-motion-why-does-motion-matter).

But they are hard to implement.

We've already had many web animation solutions that are both precise and powerful, like [Popmotion](https://popmotion.io/) and [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) and may other awesome ones, but sometimes, even these precise solutions seem to be too much work compared to the simple use case.

> "Just make this element appear smoothly, please. It should be simple."  - your product manager

That's what `TweenHere` is designed for: UI animations. It does not aim to be a library that enables any animation, but you should be able to implement most UI motions (like the ones from [Material Design](https://material.io/guidelines/motion/material-motion.html)) with this library.

With `TweenHere`, instead of specifying a start position and a end position, an animation is defined as "how an element comes to its current state", so it should work with most JS frameworks: as long as you can get the reference to a DOM node, you can animate it.

## APIs

`TweenHere` comes with two functions, `tweenHere` and `tweenExit`, each function provides a fast way to implement a kind of motions. 

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
In fact, you can get these numbers manually with `getBoundingClientRect()` and other native APIs. 

For convenience, this library provides a helper function, `getTweenState`, to capture the `TweenState` of an existing element. 

```typescript jsx
getTweenState(element: HTMLElement): TweenState
```

By using this helper function and `tweenHere`, you can easily make an element appear smoothly from the position of another element, constructing a visual effect that they are the same element.

In general, use `tweenHere` when you want an element to move to its current state smoothly, use `tweenExit` on an element when you know the element will be detached from document and want it to disappear smoothly.

## Limits

The animated element's `transform` `opacity` and `transition` style properties are not preserved.

`tweenExit` adds node to the DOM structure, so it may not be capable with some CSS styles.

This library is still at its early stage, please report an issue if you notice any undesired behavior.

## Plans

Support rotation.

Add more demos.

## License

MIT

All contributions are welcome.
