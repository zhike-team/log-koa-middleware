# log-koa-middleware
日志打印中间件

[![asciicast](https://asciinema.org/a/AWfYPWpRrdxtkK1i39vtC063k.png)](https://asciinema.org/a/AWfYPWpRrdxtkK1i39vtC063k)
# Install
```
$ npm install @zhike/log-koa-middleware
```

# Example
```
const logger = require('@zhike/log-koa-middleware')
const Koa = require('koa')

const app = new Koa()

//只打印requestBody
app.use(logger())

// 打印所有路径的headers中的content-type。只打印/player路径的responseBody
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

注意： 
1. 必会打印reqId,路径，方法，响应时间。
2. 默认打印requestBody。
3. 默认不打印responseBody。
4. responseBodyWhiteList和不能和responseBodyBlackList同时传值
5. responseBodyWhiteList和responseBodyBlackList暂未支持同一path不同method,后续会完善。