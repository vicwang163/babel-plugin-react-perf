'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/

require('colors');
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
    // check illegal use for react method
    path.traverse({
      // check illegal use like 'this.state.xxx = xxx'
      AssignmentExpression: function AssignmentExpression(path) {
        if (['constructor'].includes(method)) {
          return;
        }
        path.traverse({
          MemberExpression: function MemberExpression(path) {
            var node = path.node;
            if (node.property.name === 'state' && node.object.type === 'ThisExpression' && path.parentPath.parentKey === 'left') {
              throw path.buildCodeFrameError('Do not assign value to `state` directly');
            }
          }
        });
      }
    });

    // check these methods if they are using `this.setState`
    if (['constructor', 'componentWillMount'].includes(method)) {
      path.traverse({
        MemberExpression: function MemberExpression(path) {
          var node = path.node;
          if (node.property.name === 'setState' && node.object.type === 'ThisExpression') {
            throw path.buildCodeFrameError('Please use `this.state` in the constructor ');
          }
        }
      });
    }

    // check render function
    if (method === 'render') {
      var elementCount = 0;
      path.traverse({
        JSXOpeningElement: function JSXOpeningElement(path) {
          if (/^[^A-Z]+$/.test(path.node.name.name)) {
            elementCount++;
          }
        }
      });
      var maxRenderElements = state.opts.maxRenderElements ? state.opts.maxRenderElements : 50;
      if (elementCount > maxRenderElements) {
        var opts = path.hub.file.opts;
        var filepath = opts.filename.replace(opts.moduleRoot, '');
        var message = filepath + ': render has ' + elementCount + ' elements (maxRenderElements = ' + maxRenderElements + ')\n';
        console.log('********************react perf warning********************\n'.bold.yellow);
        console.log(message.yellow.bold);
      }
    }
    // only add perf check for non-lifecycle method
    if (!ignoreMethods.includes(method)) {
      var hasAdded = false;
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