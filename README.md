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
    requestHeaders: ['content-type'],
    responseHeaders: ['content-type'],
    responseBodyWhiteList: ['/player2']
}))
```

## Configuration Options
| 参数名                 | 类型                          |  说明  |
| --------              | -----                         | ------ |
| reqId                    | String                           | 响应标识id(如果为空则使用uuidv1自动生成reqId,并添加到ctx.body中)                            |
| requestHeaders | Array                      | 需要打印的request头部   (默认不打印)            |
| responseHeaders | Array                      | 需要打印的response头部 (默认不打印)                 |
| responseBodyWhiteList               | Array                           | 白名单                            |
| responseBodyBlackList       | Array                           | 黑名单                       |

注意： 默认打印reqId,路径，方法，响应时间，requestBody。responseBodyWhiteList和不能和responseBodyBlackList同时传值