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