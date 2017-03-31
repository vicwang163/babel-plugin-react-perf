'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/

var ignoreMethods = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillReceiveProps', 'componentWillUnmount', 'shouldComponentUpdate'];
var setFlag = new Set();

function addPerfResult(path, state) {
  var t = state.types;
  var nodes = [];
  var memberExpression = void 0;
  var callExpression = void 0;
  var expressionStatement = void 0;

  // add perf.start
  callExpression = t.callExpression(t.identifier('perfLog'), [t.identifier('Perf'), t.identifier(JSON.stringify(state.opts))]);
  expressionStatement = t.expressionStatement(callExpression);
  nodes.push(expressionStatement);

  path.insertAfter(nodes);
}

module.exports = {
  ClassMethod: function ClassMethod(path, state) {
    var method = path.node.key.name;
    if (setFlag.has(path.node)) {
      return;
    }
    setFlag.add(path.node);
    if (ignoreMethods.includes(method)) {
      return;
    } else {
      var hasAdded = false;
      debugger;
      path.traverse({
        Statement: function Statement(p, s) {
          if (p.type === 'BlockStatement' || hasAdded) {
            return;
          }
          hasAdded = true;
          addPerfResult(p, state);
        }
      });
    }
  }
};