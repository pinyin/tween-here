# TweenHere

[![Build Status](https://travis-ci.org/pinyin/tween-here.svg?branch=master)](https://travis-ci.org/pinyin/tween-here)

为现代JS框架设计的动画方案

[查看Demo (最好在大屏设备上打开)](http://pinyin.github.io/tween-here)

[Open README in English](./README.md)

## 安装

`npm install --save tween-here`

已经包含了TypeScript支持。

## 用法

TweenHere是为UI动画设计的。

例如，如果想在滚动时实现动画效果：

```html
<div style="overflow-y: scroll"> // scroll container element
    <div id="content"> // content element
    // ... elements
    </div>
</div>
```
首先，你需要像之前一样，调节容器的滚动位置：
```
container.scrollTo = 100
```
滚动内容会跳动到新位置。怎样让这个过程变得平滑呢？

有了TweenHere，你可以用三行代码解决这个问题：
```
const content = document.getElementById('content')
const snapshot = getTweenState() // get position of scrolled content
container.scrollTop = 100
tweenHere(content, snapshot) // content will move to its new position smoothly 
```

... 这个简单的API可以实现很多其他动画效果。

所有的动画都是用[FLIP技巧](https://aerotwist.com/blog/flip-your-animations/)实现的，所以性能比较好。

## 设计目标

[动画很重要](https://material.io/guidelines/motion/material-motion.html#material-motion-why-does-motion-matter)。

但动画很难实现。

我们已经有了很多优秀简洁的方案, 例如 [Popmotion](https://popmotion.io/) 和 [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)。但是，有些时候，即使这些简洁的方案也显得过于复杂。

> “这里加个动画吧，应该挺简单的” - 你的产品经理

这就是`TweenHere`的设计目标: UI动画。它并不想成为一个完整的动画库, 但你应该可以通过它实现大部分UI动画 (例如[Material Design](https://material.io/guidelines/motion/material-motion.html)里的那些)。

在`TweenHere`中，动画被定义为“一个元素如何到达它的当前位置”而不是“从一个位置运动到另一个位置”， 所以它应该可以支持大部分JS框架: 只要你可以获得DOM元素的引用，就可以动画这个DOM元素

## 用法

`TweenHere` 提供两个函数，`tweenHere`和`tweenExit`，每个函数实现一类动画。 

```typescript jsx

async function tweenHere(
    element: HTMLElement,
    from: TweenState | ((snapshot: TweenState, to: TweenState) => TweenState),
    params?: {
        duration?: number | ((from: TweenState, to: TweenState) => number),
        easing?: [number, number, number, number],
    }
): Promise<void> 

async function tweenExit(
    element: HTMLElement,
    to: TweenState | ((from: TweenState) => TweenState),
    params?: {
        duration?: number | ((from: TweenState, to: TweenState) => number),
        easing?: [number, number, number, number],
        container?: Element,
    }
): Promise<void> 
```

每个函数都只有前两个参数是必须的。

TweenState是代表元素位置的一个对象(相对视图窗口):
```typescript jsx
type TweenState = {
    x: number
    y: number
    width: number
    height: number
    opacity: number
} 
```
你可以通过`getBoundingClientRect()`和其他API手动计算出这些值。 

方便起见，也可以通过调用`getTweenState`来获得一个DOM元素的这些值。

```typescript jsx
getTweenState(element: HTMLElement): TweenState
```
[通过把这个函数的返回值传递给`tweenHere`](./demo/ParentChild.tsx)，你可以轻松让一个元素从另一个元素的位置平滑出现，从而创造出这两个元素是同一个元素的视觉效果。


总之，如果你希望一个元素平滑过渡到它的当前位置，使用`tweenHere`。如果你希望一个元素平滑地消失，使用`tweenExit`。

## 特点

使用FLIP技巧保持动画过程中的FPS

把对DOM的读写操作统一调度在microtask中，因此可以随时开始动画，不必担心触发reflow。

自动同步嵌套动画。

## 限制

被动画的元素的`transform` `opacity`和`transition`属性会被覆盖。

`tweenExit`在动画过程中会向DOM中添加元素，因此可能对特定的CSS样式产生影响。

这个库仍然在早期阶段，如果注意到不希望的行为，请报告issue。

需要运行时支持WeakMap、Set和MutationObserver。Polyfill也可以。

## 计划

增加文档。

支持旋转。

增加更多的[Demo](http://pinyin.github.io/tween-here)。

增加React/Angular/Vue的绑定。

## 类似的项目和文章

[FLIP Technique](https://aerotwist.com/blog/flip-your-animations/)

[react-flip-move](https://github.com/joshwcomeau/react-flip-move)

[Flipping](https://github.com/davidkpiano/flipping)

[react-flip-toolkit](https://github.com/aholachek/react-flip-toolkit)

## 授权

MIT

欢迎任何贡献
