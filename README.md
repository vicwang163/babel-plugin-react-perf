# babel-plugin-react-perf


## usage

npm install --save babel-plugin-react-perf

## config

```json
{
  "presets": ["es2015", "react"],
  "plugins": [
    ["react-perf",{
        "maxExecuteLimit": 3,
        "needAddPerfRule": {
          "superClass": ["Component"]
        }
      }
    ]
  ]
}
```

## react-addons-perf

version of react-addons-perf should matches version of react and react-dom