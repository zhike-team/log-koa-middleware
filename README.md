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
app.use(logger({
    escapePath: '/healthCheck'
}))
```

## Configuration Options
| 参数名                 | 类型                          |  说明  |
| --------              | -----                         | ------ |
| reqId             | String                           | 响应标识id(如果为空则使用uuidv1自动生成reqId,并添加到ctx.body中)                            |
| escapePath             | Set                           | IP 黑名单，不能与白名单同时使用。                            |
| requestBody            | Array/Object | 为空则默认全打印requestBody。为数组则只有数组内的path才打印。为对象则其omit属性为数组，只有数组内的path不打印     |
| responseBody          | boolean                       | 是否允许内网地址通过，仅能与 whitelist 配合使用。             |
| requestHeaders | string[]                      | 从 HTTP Header 中提取 IP 地址的优先级序列。                  |
| requestHeadersAttributes | string[]                      | 从 HTTP Header 中提取 IP 地址的优先级序列。                  |