'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/
const ignoreMethods = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillReceiveProps', 'componentWillUnmount', 'shouldComponentUpdate']
const setFlag = new Set()

function addPerfResult (path, state) {
  let t = state.types
  let nodes = []
  let memberExpression
  let callExpression
  let expressionStatement
  
  // add perf.start
  callExpression = t.callExpression(t.identifier('perfLog'), [t.identifier('Perf'), t.identifier(JSON.stringify(state.opts))])
  expressionStatement = t.expressionStatement(callExpression)
  nodes.push(expressionStatement)
  
  path.insertAfter(nodes)
}

module.exports = {
  ClassMethod (path, state) {
    let method = path.node.key.name
    if (setFlag.has(path.node)) {
      return
    }
    setFlag.add(path.node)
    if (ignoreMethods.includes(method)) {
      return
    } else {
      let hasAdded = false
      debugger
      path.traverse({
        Statement (p, s) {
          if (p.type === 'BlockStatement' || hasAdded) {
            return
          }
          hasAdded = true
          addPerfResult(p, state)
        }
      })
    }
  }
};
