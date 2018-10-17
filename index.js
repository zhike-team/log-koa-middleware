
const uuidv1 = require('uuid/v1')

module.exports = logger

function logger (opts) {
  let reqId
  let defaultOptions = {
    requestHeadersAttributes: 'all',
    pathConfig: {
      escape: null,
      requestBody: true,
      responseBody: true,
      requestHeaders: true
    }
  }

  // 初始化配置
  if (typeof opts === 'object') {
    if (opts.pathConfig) {
      defaultOptions.pathConfig = Object.assign(defaultOptions.pathConfig, opts.pathConfig)
    }
    if (opts.requestHeadersAttributes) {
      defaultOptions.requestHeadersAttributes = opts.requestHeadersAttributes
    }
  }

  // 初始化响应id
  if (typeof opts === 'object' && opts.reqId) {
    reqId = opts.reqId
  } else {
    reqId = uuidv1()
  }

  return async function (ctx, next) {
    let escapeFlag = confirmLog(defaultOptions.pathConfig.escape, ctx.path)

    const startTime = new Date()
    global.console.log = console.log.bind(global, `reqId: ${reqId} `)

    // 打印headers
    let headersLogFlag = escapeFlag ? false : confirmLog(defaultOptions.pathConfig.requestHeaders, ctx.path)
    if (headersLogFlag) {
      if (defaultOptions.requestHeadersAttributes === 'all') {
        console.log('[requestHeaders]:', ctx.headers)
      } else if (Array.isArray(defaultOptions.requestHeadersAttributes) && defaultOptions.requestHeadersAttributes.length) {
        const headers = ctx.headers
        const logHeaders = {}
        defaultOptions.requestHeadersAttributes.forEach(key => {
          logHeaders[key] = headers[key.toLowerCase()]
        })
        console.log('[requestHeaders]:', logHeaders)
      }
    }

    // 打印requestBody的配置
    if (!escapeFlag && ctx.request.body) {
      let logFlag = confirmLog(defaultOptions.pathConfig.requestBody, ctx.path)
      if (logFlag) {
        console.log('[requestBody]:', ctx.request.body.dataValues)
      }
    }
    // bling-bling
    await next()

    // 打印responseBody配置
    if (!escapeFlag && ctx.body) {
      let logFlag = confirmLog(defaultOptions.pathConfig.responseBody, ctx.path)
      if (logFlag) {
        console.log('[responseBody]:', ctx.data.dataValues || ctx.data)
      }

      // 没有自定义reqId则手动补充
      if (!opts || !opts.reqId) {
        ctx.body = Object.assign({reqId}, ctx.body)
      }
    } else {
      throw new Error('response没有响应值')
    }

    // 打印完整url及响应时间
    const endTime = new Date()
    console.log(ctx.method, ctx.originalUrl, ctx.status, ` ${endTime - startTime} ms`)
  }

  // 检测path是否符合详细config配置
  function confirmLog (config, path) {
    if (config === null) {
      return false
    }

    let logFlag = false

    if (config === true) {
      logFlag = true
    } else if (typeof config === 'object') {
      // 传入了自定义配置
      if (Array.isArray(config.omit)) {
        // 指定的path不打印
        if (!new Set(config.omit).has(path)) {
          logFlag = true
        }
      } else if (Array.isArray(config)) {
        // 只对指定的path打印
        if (new Set(config).has(path)) {
          logFlag = true
        }
      }
    }
    return logFlag
  }
}
