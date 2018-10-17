
const uuidv1 = require('uuid/v1')

module.exports = logger

function logger (opts) {
  let reqId
  let escapePath = null
  let displayOptions = {
    requestBody: true,
    responseBody: true,
    requestHeaders: true,
    requestHeadersAttributes: 'all'
  }

  if (typeof opts === 'object') {
    reqId = opts.reqId ? opts.reqId : uuidv1()

    // 不打印日志的path
    if (opts.escapePath && Array.isArray(opts.escapePath)) {
      escapePath = new Set(opts.escapePath)
    }

    // 不打印的参数
    const dpo = opts.displayOptions
    if (dpo && typeof dpo === 'object') {
      displayOptions = Object.assign(displayOptions, dpo)
    }
  } else {
    throw new Error('options is not a object')
  }

  return async function (ctx, next) {
    if (escapePath && escapePath.has(ctx.path)) {
      await next()
      return
    }

    const startTime = new Date()
    global.console.log = console.log.bind(global, `reqId: ${reqId} `)

    // 打印headers
    let headersLogFlag = confirmLog(displayOptions.requestHeaders, ctx.path)
    if (headersLogFlag) {
      if (displayOptions.requestHeadersAttributes === 'all') {
        console.log('[requestHeaders]:', ctx.headers)
      } else if (Array.isArray(displayOptions.requestHeadersAttributes) && displayOptions.requestHeadersAttributes.length) {
        const headers = ctx.headers
        const logHeaders = {}
        displayOptions.requestHeadersAttributes.forEach(key => {
          logHeaders[key] = headers[key.toLowerCase()]
          // console.log(`${key}: ${headers[key.toLowerCase()]}`)
        })
        console.log('[requestHeaders]:', logHeaders)
      }
    }

    // 打印requestBody的配置
    if (ctx.request.body) {
      let logFlag = confirmLog(displayOptions.requestBody, ctx.path)
      if (logFlag) {
        console.log('[requestBody]:', ctx.request.body.dataValues)
      }
    }
    // bling-bling
    await next()

    // 打印responseBody配置
    if (ctx.body) {
      let logFlag = confirmLog(displayOptions.responseBody, ctx.path)
      if (logFlag) {
        console.log('[responseBody]:', ctx.data.dataValues || ctx.data)
      }

      // 没有自定义reqId则手动补充
      if (!opts.reqId) {
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
