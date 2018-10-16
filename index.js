
const uuidv1 = require('uuid/v1')

module.exports = logger

function logger(opts){
    let reqSign = 'reqId'
    let escapePath = null
    let displayOptions = {
        requestBody: true,
        responseBody: true,
        requestHeaders: []
    }

    if(typeof opts === 'object'){
        reqSign = opts.reqSign ? opts.reqSign : reqSign

        // 不打印日志的path
        if(opts.escapePath && Array.isArray(opts.escapePath)){
            escapePath = new Set(opts.escapePath)
        }

        // 不打印的参数
        const dpo = opts.displayOptions
        if(dpo && typeof dpo === 'object'){
            displayOptions = Object.assign(displayOptions, dpo)
        }
    } else {
        throw new Error('options is not a object')
    }

    return async function(ctx, next){
        if(escapePath && escapePath.has(ctx.path)){
            await next()
            return
        }

        const startTime = new Date()
        const requestId = uuidv1()
        global.console.log = console.log.bind(global,`${reqSign}: ${requestId} `)

        if(Array.isArray(displayOptions.requestHeaders)){
            const headerArray = displayOptions.requestHeaders
            console.log('requestHeaders:')

            if(headerArray.length){
                const headers = ctx.headers
                headerArray.forEach(key => {
                    console.log(`${key}: ${headers[key]}`)
                })
            } else {
                console.log(ctx.headers)
            }
        }

        if(ctx.request.body && displayOptions.requestBody){
            console.log('requestBody:', ctx.request.body)
        }

        await next()
        const endTime = new Date()

        const reqWrapper = {}
        reqWrapper[reqSign] = requestId

        if(ctx.body){
            console.log('responseBody:', ctx.data)
            ctx.body = Object.assign(reqWrapper, ctx.body)
        } else {
            ctx.body = reqWrapper
        }
        console.log(ctx.reqId, ctx.method, ctx.originalUrl, ctx.status, `- ${endTime - startTime} ms`)
    }
}