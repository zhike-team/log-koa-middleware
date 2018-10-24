
const uuidv1 = require('uuid/v1')

module.exports = logger

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

  // 初始化响应id
  if (typeof opts === 'object' && opts.reqId) {
    reqId = opts.reqId
  } else {
    reqId = uuidv1()
  }

  return async function (ctx, next) {
    const startTime = new Date()

    // 柯里化，对console.log添加reqId
    const orginalLogger = console.log 
    console.log = console.log.bind(console, `${reqId}: `)

    orginalLogger(`----> ${reqId}`)
    orginalLogger(ctx.method, ctx.originalUrl)

    // 打印requestHeaders
    const headers = ctx.headers
    const requestHeaders = defaultOptions.requestHeaders
    if (Array.isArray(requestHeaders) && requestHeaders.length > 0) {
      requestHeaders.forEach(item => {
        if (headers[item.toLowerCase()]) {
          orginalLogger(`${item}: ${headers[item]}`)
        }
      })
    }

    // 打印requestBody的配置
    if (ctx.request.body) {
      orginalLogger(ctx.request.body)
    }

    // bling-bling
    await next()


    // 打印完整url及响应时间
    const endTime = new Date()

    orginalLogger(`<---- ${reqId} ${ctx.status} ${endTime - startTime} ms`)
    // 打印responseHeaders
    const resHeaders = ctx.response.headers
    const responseHeaders = defaultOptions.responseHeaders
    if (Array.isArray(responseHeaders) && responseHeaders.length > 0) {
      responseHeaders.forEach(item => {
        if (resHeaders[item.toLowerCase()]) {
          orginalLogger(`${item}: ${resHeaders[item]}`)
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

      if (Array.isArray(responseBodyWhiteList) && responseBodyWhiteList.length>0) {
        for (let path of responseBodyWhiteList) {
          if (path === ctx.path || (path instanceof RegExp && path.test(ctx.path))) {
            orginalLogger(logBody)
          } 
        }
      } else if (Array.isArray(responseBodyBlackList) && responseBodyBlackList.length>0) {
        for (let path of responseBodyBlackList) {
          if (path !== ctx.path && (path instanceof RegExp && !path.test(ctx.path))) {
            orginalLogger(logBody)
          } 
        }
      }

      // 没有自定义reqId则手动补充
      if (!opts || !opts.reqId) {
        ctx.body = Object.assign({reqId}, ctx.body)
      }
    } else {
      throw new Error('response没有响应值')
    }

  }

}
