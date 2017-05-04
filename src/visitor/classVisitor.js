'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/
require('colors')
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

function renderCheck (path, state) {
  let elementCount = 0
  path.traverse({
    JSXOpeningElement (path) {
      if (/^[^A-Z]+$/.test(path.node.name.name)) {
        elementCount ++
      }
    }
  })
  let maxRenderElements = state.opts.maxRenderElements ? state.opts.maxRenderElements : 50
  if (elementCount > maxRenderElements) {
    let opts = path.hub.file.opts
    let filepath = opts.filename.replace(opts.moduleRoot, '')
    let message = `${filepath}: render has ${elementCount} elements (maxRenderElements = ${maxRenderElements})\n`
    console.log('********************react perf warning********************\n'.bold.yellow)
    console.log(message.yellow.bold)
  }  
}

module.exports = {
  ClassMethod (path, state) {
    let method = path.node.key.name
    if (setFlag.has(path.node)) {
      return
    }
    setFlag.add(path.node)
    // check illegal use for react method
    path.traverse({
      // check illegal use like 'this.state.xxx = xxx'
      AssignmentExpression (path) {
        if (['constructor'].includes(method)) {
          return
        }
        path.traverse({
          MemberExpression (path) {
            let node = path.node
            if (node.property.name === 'state' && node.object.type === 'ThisExpression' && path.parentPath.parentKey === 'left') {
              throw path.buildCodeFrameError('Do not assign value to `state` directly');
            }
          }
        })
      },
      ExpressionStatement (path) {
        let invalidStatements = []
        let file
        let code
        try {
          file = path.hub.file.code
          code = file.slice(path.node.start, path.node.end)
          invalidStatements = state.opts.invalidStatements
        } catch (e){
          console.log(e)
        }
        for (let i = 0; i < invalidStatements.length; i++) {
          let reg = new RegExp(invalidStatements[i])
          if (reg.test(code)) {
            throw path.buildCodeFrameError(`Invalid Statement is checked by '${invalidStatements[i]}'`);
          }
        }
      }
    })
    
    // check these methods if they are using `this.setState`
    if (['constructor', 'componentWillMount'].includes(method)) {
      path.traverse({
        MemberExpression (path) {
          let node = path.node
          if (node.property.name === 'setState' && node.object.type === 'ThisExpression') {
            throw path.buildCodeFrameError('Please use `this.state` in the constructor ');
          }
        }
      })
    }
    
    // check render function
    if (method === 'render') {
      renderCheck(path, state)
    }
    // only add perf check for non-lifecycle method
    if (!ignoreMethods.includes(method)) {
      let hasAdded = false
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
