## Funky

[![Greenkeeper badge](https://badges.greenkeeper.io/mikeal/funky.svg)](https://greenkeeper.io/)

Front-end view system using basic functional programming and template literals.

## Usage

#### `funk` | `funk.view`

```javascript
var funk = require('funky')
var docview = funk`
  <div class="container">
    ${item => item.text}
  </div>
`

document.body.appendChild(docview({text: "Hello World!"}))
```

The `funk` and `funk.view` are function handlers for string template literals. 
The return value is a function.

When called this function returns a DOM element with some properties added. 
Any variables passed to the view function are passed to every function in the
template literal and the element will use the return values from those
functions.

#### `element.update()`

```javascript
var funk = require('funky')
var docview = funk`
  <div class="container" id="${item => item.id}">
    ${item => item.text}
  </div>
`

document.body.appendChild(docview({text: "Hello World!", id: 'hello'}))

var element = docview({text: "Hello Second Line.", id: 'second-hello'})
document.body.appendChild(element)

// Update content 3 seconds after adding to DOM.
setTimeout(() => {
  element.update({text: "Updated, Hello Second Line.", id: 'second-hello'})
  document.getElementById('hello').update({text: "Updated", id: "hello"})
}, 1000 * 3)
```

DOM elements created by funky views have a method attached named `update`. This
function is used to update the element with new values as if they had been
passed to the original view creation.

Below the surface this uses 
[`yo-yo.update`](https://github.com/maxogden/yo-yo#updating-events) 
which uses efficient DOM diffing.

#### `funk.list`

List views are designed to operate almost exactly like regular JavaScript 
Arrays except when items are removed, added, or re-ordered, new views are
rendered to the DOM.

```javascript
var simpleview = funk`
  <div class="container">
    ${text => text}
  </div>
`
var list = funk.list(simpleview, ["Hello World!", "Hello Second Line."])
document.body.appendChild(list.node)
```

The `list.node` property is the DOM node that can be attached.

List views can also directly be passed into other views.

```javascript
var simpleview = funk`
  <div class="container">
    ${text => text}
  </div>
`
var list = funk.list(simpleview, ["Hello World!", "Hello Second Line."])
var listContainer = funk`<div id=${id => id}">${list}</div>`('list-container')
document.body.appendChild(listContainer)
```
