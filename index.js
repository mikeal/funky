var yo = require('yo-yo')

function parse (strings, values) {
  // The raw arrays are no actually mutable, copy.
  strings = strings.slice()
  values = values.slice()
  let shadowStrings = []
  let shadowValues = []
  let elementStrings = []
  let elementValues = []
  let constructors = []
  let s = strings.join('').replace(/ /g, '')
  let name = s.slice(s.indexOf('<') + 1, s.indexOf('>'))

  let fullstring = ''
  let valueMap = {}

  let i = 0
  while (i < strings.length) {
    fullstring += strings[i]
    valueMap[fullstring.length + '-' + i] = values[i]
    i++
  }

  let opener = `<${name}>`
  let openPos = fullstring.indexOf(opener)
  let closer = `</${name}>`
  let closePos = fullstring.lastIndexOf(closer)

  if (openPos === -1) throw new Error('Cannot find open position.')
  if (closePos === -1) throw new Error('Cannot find close position.')

  for (let posName in valueMap) {
    let pos = +posName.slice(0, posName.indexOf('-'))
    let val = valueMap[posName]

    if (pos < openPos) constructors.push(val)
    else if (pos > openPos && pos < closePos) {
      elementValues.push(val)
    } else if (pos > closePos) {
      shadowValues.push(val)
    } else {
      throw new Error('Parser error, cannot assign value.')
    }
  }

  i = 0
  let pos = 0
  while (i < strings.length) {
    let str = strings[i]

    let iter = () => {
      if (pos >= fullstring.length) return
      if (pos >= openPos) {
        if (pos > closePos) {
          shadowStrings.push(str)
        } else {
          if (str.indexOf(closer) !== -1) {
            let _pos = str.indexOf(closer) + closer.length + 1
            elementStrings.push(str.slice(0, _pos))
            str = str.slice(_pos)
            pos += _pos
            return iter()
          } else {
            elementStrings.push(str)
          }
        }
      } else {
        if (str.indexOf(opener) !== -1) {
          let _pos = str.indexOf(opener)
          str = str.slice(_pos)
          pos = pos + _pos
          return iter()
        }
      }
      pos = pos + str.length
    }
    iter()
    i++
  }
  // TODO: type checking on constructors and destructors

  let result = {
    name,
    constructors,
    shadowStrings,
    shadowValues,
    elementStrings,
    elementValues
  }
  return result
}

function view (strings, ...inserts) {
  let parsed = parse(strings, inserts)

  function _callInserts (args, getElement) {
    var ret = parsed.elementValues.map(i => {
      if (i.node) return i.node

      if (typeof i === 'function') return i.apply(this, args)
      return i
    })
    return ret
  }

  function _viewReturn () {
    var args = Array.prototype.slice.call(arguments)
    var element = yo(parsed.elementStrings, ..._callInserts(args))
    parsed.constructors.forEach(c => c(...[element].concat(args)))
    // TODO: attach ShadowDOM
    element.yoyoOpts = {}
    element.update = function () {
      let newelement = element.processUpdate.apply(element, arguments)
      yo.update(element, newelement, element.yoyoOpts)
    }
    element.processUpdate = function () {
      var args = Array.prototype.slice.call(arguments)
      var _inserts = [..._callInserts(args)]
      var newelement = yo(parsed.elementStrings, ..._inserts)
      return newelement
    }
    element._funkView = true
    return element
  }
  return _viewReturn
}

module.exports = view
module.exports.attr = (key) => (doc) => doc[key]
