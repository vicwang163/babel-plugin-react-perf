'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/
const ignoreMethods = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillReceiveProps', 'componentWillUnmount', 'shouldComponentUpdate']
const setFlag = new Set()

function getWastedExpression (path, t) {
  let nodes = []
  let argsExpression
  let memberExpression
  let callExpression
  let expressionStatement
  let variableDeclarator
  let variableDeclaration
  let ifStatement
  let conditionStatement
  let wastedVariable = '_wastedInfo'
  // wasted
  memberExpression = t.memberExpression(t.identifier('Perf'),t.identifier('getWasted'))
  callExpression = t.callExpression(memberExpression, [])
  variableDeclarator = t.variableDeclarator(t.identifier(wastedVariable), callExpression)
  variableDeclaration = t.variableDeclaration('let', [variableDeclarator])
  nodes.push(variableDeclaration)
  
  // if statement for waste report
  let ifNodes = []
  memberExpression = t.memberExpression(t.identifier('console'),t.identifier('info'))
  argsExpression = [t.stringLiteral('%c react-Perf: wasted report'), t.stringLiteral('color:red;font-size:20px')]
  callExpression = t.callExpression(memberExpression, argsExpression)
  expressionStatement = t.expressionStatement(callExpression)
  ifNodes.push(expressionStatement)
  
  memberExpression = t.memberExpression(t.identifier('console'),t.identifier('table'))
  callExpression = t.callExpression(memberExpression, [t.identifier(wastedVariable)])
  expressionStatement = t.expressionStatement(callExpression)
  ifNodes.push(expressionStatement)
  
  conditionStatement = t.memberExpression(t.identifier(wastedVariable), t.identifier('length'))
  ifStatement = t.ifStatement(conditionStatement, t.blockStatement(ifNodes))
  
  nodes.push(ifStatement)
  
  return nodes
}

function getInclusiveExpression (path, state) {
  let t = state.types
  let nodes = []
  let argsExpression
  let memberExpression
  let callExpression
  let expressionStatement
  let variableDeclarator
  let variableDeclaration
  let ifStatement
  let conditionStatement
  let inclusiveVariable = '_inclusiveInfo'
  let maxExecuteLimit = 10
  if (state.opts && state.opts.maxExecuteLimit) {
    maxExecuteLimit = state.opts.maxExecuteLimit
  }

  // inclusive 
  memberExpression = t.memberExpression(t.identifier('Perf'),t.identifier('getInclusive'))
  callExpression = t.callExpression(memberExpression, [])
  variableDeclarator = t.variableDeclarator(t.identifier(inclusiveVariable), callExpression)
  variableDeclaration = t.variableDeclaration('let', [variableDeclarator])
  nodes.push(variableDeclaration)
  
  // add filter
  let assignmentExpression = t.assignmentExpression('=', t.identifier(inclusiveVariable), t.callExpression(
    t.memberExpression(t.identifier(inclusiveVariable),t.identifier('filter')),
    [t.functionExpression(null, [t.identifier('item')], t.blockStatement(
      [
        t.returnStatement(t.binaryExpression('>', t.memberExpression(t.identifier('item'), t.identifier('inclusiveRenderDuration')), t.numericLiteral(maxExecuteLimit)))
      ]
    ))]
    )
  )
  expressionStatement = t.expressionStatement(assignmentExpression)
  nodes.push(expressionStatement)

  // if statement for inclusive report
  let ifNodes = []
  memberExpression = t.memberExpression(t.identifier('console'),t.identifier('info'))
  argsExpression = [t.stringLiteral('%c react-Perf: inclusive report (maxExecuteLimit='+maxExecuteLimit+'ms)'), t.stringLiteral('color:red;font-size:20px')]
  callExpression = t.callExpression(memberExpression, argsExpression)
  expressionStatement = t.expressionStatement(callExpression)
  ifNodes.push(expressionStatement)
  
  memberExpression = t.memberExpression(t.identifier('console'),t.identifier('table'))
  callExpression = t.callExpression(memberExpression, [t.identifier(inclusiveVariable)])
  expressionStatement = t.expressionStatement(callExpression)
  ifNodes.push(expressionStatement)
  
  conditionStatement = t.memberExpression(t.identifier(inclusiveVariable), t.identifier('length'))
  ifStatement = t.ifStatement(conditionStatement, t.blockStatement(ifNodes))
  
  nodes.push(ifStatement)
  
  return nodes
}

function functionBlock (path, state) {
  let t = state.types
  let nodes = []
  let memberExpression
  let callExpression
  let expressionStatement
  
  memberExpression = t.memberExpression(t.identifier('Perf'),t.identifier('stop'))
  callExpression = t.callExpression(memberExpression, [])
  expressionStatement = t.expressionStatement(callExpression)
  nodes.push(expressionStatement)
  
  nodes = nodes.concat(getWastedExpression(path, t))
  
  nodes = nodes.concat(getInclusiveExpression(path, state))
  
  return nodes
}

function addPerfResult (path, state) {
  let t = state.types
  let nodes = []
  let memberExpression
  let argsExpression
  let callExpression
  let expressionStatement
  let variableDeclarator
  let variableDeclaration
  let blockStatement
  let functionExpression
  let wastedVariable = '_wastedInfo'
  
  // add perf.start
  memberExpression = t.memberExpression(t.identifier('Perf'),t.identifier('start'))
  callExpression = t.callExpression(memberExpression, [])
  expressionStatement = t.expressionStatement(callExpression)
  nodes.push(expressionStatement)
  
  blockStatement = t.blockStatement(functionBlock(path, state))
  functionExpression = t.functionExpression(null, [], blockStatement)
  
  callExpression = t.callExpression(t.identifier('setTimeout'), [functionExpression, t.numericLiteral(200)])
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
