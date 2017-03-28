'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/

var ignoreMethods = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillReceiveProps', 'componentWillUnmount', 'shouldComponentUpdate'];

function getWastedExpression(path, t) {
  var nodes = [];
  var argsExpression = void 0;
  var memberExpression = void 0;
  var callExpression = void 0;
  var expressionStatement = void 0;
  var variableDeclarator = void 0;
  var variableDeclaration = void 0;
  var ifStatement = void 0;
  var conditionStatement = void 0;
  var wastedVariable = '_wastedInfo';
  // wasted
  memberExpression = t.memberExpression(t.identifier('Perf'), t.identifier('getWasted'));
  callExpression = t.callExpression(memberExpression, []);
  variableDeclarator = t.variableDeclarator(t.identifier(wastedVariable), callExpression);
  variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
  nodes.push(variableDeclaration);

  // if statement for waste report
  var ifNodes = [];
  memberExpression = t.memberExpression(t.identifier('console'), t.identifier('info'));
  argsExpression = [t.stringLiteral('%c react-Perf: wasted report'), t.stringLiteral('color:red;font-size:20px')];
  callExpression = t.callExpression(memberExpression, argsExpression);
  expressionStatement = t.expressionStatement(callExpression);
  ifNodes.push(expressionStatement);

  memberExpression = t.memberExpression(t.identifier('console'), t.identifier('table'));
  callExpression = t.callExpression(memberExpression, [t.identifier(wastedVariable)]);
  expressionStatement = t.expressionStatement(callExpression);
  ifNodes.push(expressionStatement);

  conditionStatement = t.memberExpression(t.identifier(wastedVariable), t.identifier('length'));
  ifStatement = t.ifStatement(conditionStatement, t.blockStatement(ifNodes));

  nodes.push(ifStatement);

  return nodes;
}

function getInclusiveExpression(path, state) {
  var t = state.types;
  var nodes = [];
  var argsExpression = void 0;
  var memberExpression = void 0;
  var callExpression = void 0;
  var expressionStatement = void 0;
  var variableDeclarator = void 0;
  var variableDeclaration = void 0;
  var ifStatement = void 0;
  var conditionStatement = void 0;
  var inclusiveVariable = '_inclusiveInfo';
  var maxExecuteLimit = 10;
  if (state.opts && state.opts.maxExecuteLimit) {
    maxExecuteLimit = state.opts.maxExecuteLimit;
  }

  // inclusive 
  memberExpression = t.memberExpression(t.identifier('Perf'), t.identifier('getInclusive'));
  callExpression = t.callExpression(memberExpression, []);
  variableDeclarator = t.variableDeclarator(t.identifier(inclusiveVariable), callExpression);
  variableDeclaration = t.variableDeclaration('let', [variableDeclarator]);
  nodes.push(variableDeclaration);

  // add filter
  var assignmentExpression = t.assignmentExpression('=', t.identifier(inclusiveVariable), t.callExpression(t.memberExpression(t.identifier(inclusiveVariable), t.identifier('filter')), [t.functionExpression(null, [t.identifier('item')], t.blockStatement([t.returnStatement(t.binaryExpression('>', t.memberExpression(t.identifier('item'), t.identifier('inclusiveRenderDuration')), t.numericLiteral(maxExecuteLimit)))]))]));
  expressionStatement = t.expressionStatement(assignmentExpression);
  nodes.push(expressionStatement);

  // if statement for inclusive report
  var ifNodes = [];
  memberExpression = t.memberExpression(t.identifier('console'), t.identifier('info'));
  argsExpression = [t.stringLiteral('%c react-Perf: inclusive report (maxExecuteLimit=' + maxExecuteLimit + 'ms)'), t.stringLiteral('color:red;font-size:20px')];
  callExpression = t.callExpression(memberExpression, argsExpression);
  expressionStatement = t.expressionStatement(callExpression);
  ifNodes.push(expressionStatement);

  memberExpression = t.memberExpression(t.identifier('console'), t.identifier('table'));
  callExpression = t.callExpression(memberExpression, [t.identifier(inclusiveVariable)]);
  expressionStatement = t.expressionStatement(callExpression);
  ifNodes.push(expressionStatement);

  conditionStatement = t.memberExpression(t.identifier(inclusiveVariable), t.identifier('length'));
  ifStatement = t.ifStatement(conditionStatement, t.blockStatement(ifNodes));

  nodes.push(ifStatement);

  return nodes;
}

function functionBlock(path, state) {
  var t = state.types;
  var nodes = [];
  var memberExpression = void 0;
  var callExpression = void 0;
  var expressionStatement = void 0;

  memberExpression = t.memberExpression(t.identifier('Perf'), t.identifier('stop'));
  callExpression = t.callExpression(memberExpression, []);
  expressionStatement = t.expressionStatement(callExpression);
  nodes.push(expressionStatement);

  nodes = nodes.concat(getWastedExpression(path, t));

  nodes = nodes.concat(getInclusiveExpression(path, state));

  return nodes;
}

function addPerfResult(path, state) {
  var t = state.types;
  var nodes = [];
  var memberExpression = void 0;
  var argsExpression = void 0;
  var callExpression = void 0;
  var expressionStatement = void 0;
  var variableDeclarator = void 0;
  var variableDeclaration = void 0;
  var blockStatement = void 0;
  var functionExpression = void 0;
  var wastedVariable = '_wastedInfo';

  // add perf.start
  memberExpression = t.memberExpression(t.identifier('Perf'), t.identifier('start'));
  callExpression = t.callExpression(memberExpression, []);
  expressionStatement = t.expressionStatement(callExpression);
  nodes.push(expressionStatement);

  blockStatement = t.blockStatement(functionBlock(path, state));
  functionExpression = t.functionExpression(null, [], blockStatement);

  callExpression = t.callExpression(t.identifier('setTimeout'), [functionExpression, t.numericLiteral(200)]);
  expressionStatement = t.expressionStatement(callExpression);
  nodes.push(expressionStatement);

  path.insertAfter(nodes);
}

module.exports = {
  ClassMethod: function ClassMethod(path, state) {
    var method = path.node.key.name;
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