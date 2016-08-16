var yo = require('yo-yo')
var array = require('array')

function view (strings, ...inserts) {
  function _callInserts (args, getElement) {
    var ret = inserts.map(i => {
      if (i.node) return i.node

      if (typeof i === 'function') return i.apply(this, args)
      return i
    })
    return ret
  }

  function _viewReturn () {
    var args = Array.prototype.slice.call(arguments)
    var element = yo(strings, ..._callInserts(args))
    element.update = function () {
      var args = Array.prototype.slice.call(arguments)
      var _inserts = [..._callInserts(args)]
      var newelement = yo(strings, ..._inserts)
      yo.update(element, newelement)
    }
    element._funkView = true
    return element
  }
  return _viewReturn
}

// Experimental, may not work.
function list (_view, arr) {
  if (!arr) arr = []
  arr = array(arr)

  arr.node = document.createDocumentFragment()
  function refresh () {
    arr.node.innerHTML = ''
    arr.forEach(d => arr.node.appendChild(_view(d)))
  }

  arr.on('add', (item, index) => {
    refresh() // TODO: handle additions without a full refresh
  })
  arr.on('remove', (item, index) => {
    refresh() // TODO: handle removals without a full refresh
  })

  refresh()
  return arr
  // return array-like-object that has a .node property that is a dom node
}

module.exports = view
module.exports.attr = (key) => (doc) => doc[key]
module.exports.list = list
module.exports.event = event
