
const uuidv4 = require('uuid/v4')

module.exports = logger

logger.originalLogger = console.log 

function logger (opts) {
  let reqId
  let defaultOptions = {
    requestHeaders: [],
    responseHeaders: [],
    responseBodyWhiteList:[],
    responseBodyBlackList:[]
  }

  // 初始化配置
  if (typeof opts === 'object') {
    defaultOptions = Object.assign(defaultOptions, opts)
  }

  return async function (ctx, next) {
    // options请求不打印日志
    if (ctx.method === 'OPTIONS') {
      await next()
      return
    }

    // 初始化响应id
    if (typeof opts === 'object' && opts.reqId) {
      reqId = ctx[opts.reqId]
    } else if (ctx.reqId) {
      reqId = ctx.reqId
    } else {
      reqId = uuidv4()
    }

    const startTime = new Date()

    console.log = logger.originalLogger.bind(console, `${reqId}: `)

    logger.originalLogger(`--------> req[${reqId}]`)
    console.log(ctx.method, ctx.originalUrl)

    // 打印requestHeaders
    const headers = ctx.headers
    const requestHeaders = defaultOptions.requestHeaders
    if (Array.isArray(requestHeaders) && requestHeaders.length > 0) {
      requestHeaders.forEach(item => {
        if (headers[item.toLowerCase()]) {
          console.log(`${item}: ${headers[item]}`)
        }
      })
    }

    // 打印requestBody的配置
    if (ctx.request.rawBody) {
      console.log(ctx.request.rawBody)
    }

    // request 结束符
    logger.originalLogger(`-------- req[${reqId}]`)

    // bling-bling
    await next()

    // 打印responseHeaders
    const resHeaders = ctx.response.headers
    const responseHeaders = defaultOptions.responseHeaders
    if (Array.isArray(responseHeaders) && responseHeaders.length > 0) {
      logger.originalLogger(`======== resp headers[${reqId}]`)
      responseHeaders.forEach(item => {
        if (resHeaders[item.toLowerCase()]) {
          console.log(`${item}: ${resHeaders[item]}`)
        }
      })
    }

    // 打印responseBody配置
    if (ctx.body) {
      const responseBodyWhiteList = defaultOptions.responseBodyWhiteList
      const responseBodyBlackList = defaultOptions.responseBodyBlackList
      
      let logBody = ctx.body
      if(/application\/json/.test(ctx.response.get('content-type'))) {
        logBody = JSON.stringify(ctx.body, null, '  ')
      }

      // 用户可以在业务代码中添加该标志来应对 正则匹配后的剔除情况
      if (ctx.useResponseBodyOption !== false) {
        if (Array.isArray(responseBodyWhiteList) && responseBodyWhiteList.length>0) {
          for (let path of responseBodyWhiteList) {
            if (path === ctx.path || (path instanceof RegExp && path.test(ctx.path))) {
              logger.originalLogger(`======== resp body[${reqId}]`)
              console.log(logBody)
            } 
          }
        } else if (Array.isArray(responseBodyBlackList) && responseBodyBlackList.length>0) {
          for (let path of responseBodyBlackList) {
            if (path !== ctx.path && (path instanceof RegExp && !path.test(ctx.path))) {
              logger.originalLogger(`======== resp body[${reqId}]`)
              console.log(logBody)
            } 
          }
        }
      }
    }

    // response 结束符
    // 打印完整url及响应时间
    const endTime = new Date()
    logger.originalLogger(`<======== resp[${reqId}] ${ctx.status} ${endTime - startTime} ms`)
  }

}
