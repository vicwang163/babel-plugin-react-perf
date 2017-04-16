# babel-plugin-react-perf

# Introduction
对于babel-plugin-react-perf这款插件，主要是用来分析和检测react代码使用不当的地方
1. 首先会在编译阶段对react组件进行分析，对于严重的语句，直接进行报错，而对于警告类的，只是给予警告
2. 然后在运行阶段，会自动注入代码，对于执行时间过长和有重新渲染的组件进行console日志的提示

## usage

npm install --save babel-plugin-react-perf

## config

```json
{
  "presets": ["es2015", "react"],
  "plugins": [
    ["react-perf",{
        "maxExecuteLimit": 5,
        "maxRenderElements": 50,
        "needAddPerfRule": {
          "superClass": ["Component"]
        }
      }
    ]
  ]
}
```

## fields

### maxExecuteLimit
react组件最大执行时间（单位ms），如果超过这个时间，会在runtime跑出一个error

### maxRenderElements
react组件包括的最大元素数，如果超过这个值，表示组件可以考虑颗粒化

### needAddPerfRule
对于有些组件，不需要进行分析，所以对于这个参数，可以配置哪些类需要被perf插件检测
superClass表示父类，一般情况下，好多react组件都继承`Component`

## 编译阶段分析
1. 不能使用`this.state.xxx = xxx`的语句
2. 在componentWillMount,constructor里面使用`this.setState`,可以吧state写在constructor里面 `this.state= {}`

## 运行阶段分析
利用'react-addons-perf'插件进行自动注入分析
1. getWasted
2. getInclusive
