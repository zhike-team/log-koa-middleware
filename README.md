# log-koa-middleware
日志打印中间件

# Install
```
$ npm install @zhike/log-koa-middleware
```

# Example
```
const logger = require('@zhike/log-koa-middleware')
const Koa = require('koa')

const app = new Koa()

//将打印所有路径的headers,requestBody,rresponseBody
app.use(logger())

// 只打印/player路径的headers和requestBody
app.use(logger({
    requestHeadersAttributes: ['content-type', 'host'],
    pathConfig: {
        logOnly: ['/player'],
        responseBody:[]
    }
}))
```

## Configuration Options
| 参数名                 | 类型                          |  说明  |
| --------              | -----                         | ------ |
| reqId                    | String                           | 响应标识id(如果为空则使用uuidv1自动生成reqId,并添加到ctx.body中)                            |
| requestHeadersAttributes | Array                      | 需要打印的头部                  |
| pathConfig               | Object                           | 路径相关配置                            |
| pathConfig.logOnly        | Array/Object                           | 对于headers,requestBody,requestResponse,默认全打印。为数组则只有数组内的path才打印(空数组即都不打印)。为对象则需其omit属性为数组，只有数组内的path不打印                       |
| pathConfig.requestBody   | Array/Object | 默认所有路径都打印requestBody。为数组则只有数组内的path打印(空数组即都不打印)。为对象则需其omit属性为数组，只有数组内的path不打印     |
| pathConfig.responseBody  | Array/Object | 默认所有路径都打印requestBody。为数组则只有数组内的path打印(空数组即都不打印)。为对象则其omit属性为数组，只有数组内的path不打印     |
| pathConfig.requestHeaders  | Array/Object | 默认所有路径都打印requestBody。为数组则只有数组内的path打印(空数组即都不打印)。为对象则其omit属性为数组，只有数组内的path不打印     |

注意： pathConfig.logOnly相当于第一道开关，pathConfig的其他属性是 在第一道开关(已放行，将打印headers,requestBody,responseBody的path)的基础上的限制
即使是没有经过第一道开关的路由，也将会打印 reqId,路径，方法，响应时间