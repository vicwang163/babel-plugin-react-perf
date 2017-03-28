'use strict';
/*
* author: vic.wang
* github: https://github.com/vicwang163
*/
let classVisitor = require('./visitor/classVisitor')

function importPerfClass (path, types) {
  let nodes = []
  // add perf component
  let identifier = types.identifier('Perf')
  let importDefaultSpecifier = types.importDefaultSpecifier(identifier);
  let importDeclaration = types.importDeclaration([importDefaultSpecifier],types.stringLiteral('react-addons-perf'));
  nodes.push(importDeclaration)
  path.insertAfter(nodes)
}

module.exports = function(babel) {
    var t = babel.types; // AST模块
    return {
      visitor:{
        Class (path, state) {
          let node = path.node
          let superClass = node.superClass.name
          if (superClass !== 'Component' && state.opts.needAddPerfRule && !state.opts.needAddPerfRule.superClass.includes(superClass)) {
            return
          }
          path.traverse(classVisitor, {types: t, opts: state.opts});
        },
        ImportDeclaration (path, state) {
          let node = path.node
          let needAddPerf = node.specifiers.some((item) => {
            if (item.local.name === 'Component') {
              return true
            } else if (state.opts.needAddPerfRule && state.opts.needAddPerfRule.superClass.includes(item.local.name)) {
              return true
            }
          })
          if (needAddPerf) {
            importPerfClass(path, t)
          }
        }
      }
    }
};