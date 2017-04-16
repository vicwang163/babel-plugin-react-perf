'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/

var classVisitor = require('./visitor/classVisitor');
var projectPath = require('path').join(__dirname, '..', '..', '..');

function importPerfClass(path, types) {
  var nodes = [];
  // add perf component
  var identifier = types.identifier('Perf');
  var importDefaultSpecifier = types.importDefaultSpecifier(identifier);
  var importDeclaration = types.importDeclaration([importDefaultSpecifier], types.stringLiteral('react-addons-perf'));
  nodes.push(importDeclaration);
  // add perf log
  identifier = types.identifier('perfLog');
  importDefaultSpecifier = types.importDefaultSpecifier(identifier);
  importDeclaration = types.importDeclaration([importDefaultSpecifier], types.stringLiteral('babel-plugin-react-perf/lib/log.js'));
  nodes.push(importDeclaration);
  path.insertAfter(nodes);
}

module.exports = function (babel) {
  var t = babel.types; // AST模块
  return {
    visitor: {
      Class: function Class(path, state) {
        var node = path.node;
        var superClass = node.superClass.name;
        if (superClass !== 'Component' && state.opts.needAddPerfRule && !state.opts.needAddPerfRule.superClass.includes(superClass)) {
          return;
        }
        path.traverse(classVisitor, { types: t, opts: state.opts });
      },
      ImportDeclaration: function ImportDeclaration(path, state) {
        var node = path.node;
        var needAddPerf = node.specifiers.some(function (item) {
          if (item.local.name === 'Component') {
            return true;
          } else if (state.opts.needAddPerfRule && state.opts.needAddPerfRule.superClass.includes(item.local.name)) {
            return true;
          }
        });
        if (needAddPerf) {
          importPerfClass(path, t);
        }
      },
      Program: function Program(path, state) {
        if (!state.opts.reportDir) {
          state.opts.reportDir = './';
        } else if (!state.opts.init) {
          state.opts.init = true;
          state.opts.reportDir = require('path').join(projectPath, state.opts.reportDir);
        }
      }
    }
  };
};