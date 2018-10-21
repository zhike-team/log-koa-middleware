const assert = require('assert')
const request = require('supertest')
const Koa = require('koa')
const Router = require('koa-router')
var bodyParser = require('koa-bodyparser');
const logger = require('../index')
const sinon = require('sinon')

const app = new Koa()

app.use(bodyParser())

const router = new Router()
app.use(router.routes())

const server = app.listen()

async function passed(ctx, next) {
  ctx.status = 200
  ctx.body = {b: 'passed'}
}

const logMiddleware = logger({
		requestHeadersAttributes: ['content-type'],
		pathConfig: {
			responseBody: []
		}
})
const logMiddleware1 = logger({
    pathConfig: {
        logOnly: {omit: ['/player1']}
    }
})
const logMiddleware2 = logger()

router.post('/player', logMiddleware, passed)
router.post('/player1', logMiddleware1, passed)
router.post('/player2', logMiddleware2, passed)

let log
describe('测试配置', function () {
	beforeEach(function () {
		log = sinon.spy(console, 'log')
	})

	afterEach(function () {
		log.restore()
	})

  it('headers只打印content-type,不打印requestBody', async function () {
    await request(server)
			.post('/player')
			.set('content-type', 'application/json')
			.set('host', 'localhost')
			.set('Accept', 'application/json')
      .send({"name":"john"})
			.expect(200)
			.then((data)=>{
				const requestHeaders = log.getCall(0).args[1] 
				assert.ok(requestHeaders['content-type'] && !requestHeaders['host'])

				assert.ok(log.getCall(2).args[0] !== '[responseBody]:')
			})
  })
  it('play1不打印headers,requestBody,responseBody', async function () {
    await request(server)
			.post('/player1')
			.set('content-type', 'application/json')
      .send({"name":"john"})
			.expect(200)
			.then((data)=>{
				assert.ok(log.getCall(0).args[0] === 'POST')
			})
  })
  it('/player2打印所有', async function () {
    await request(server)
      .post('/player2')
      .send({"name":"john"})
      .set('content-type', 'applicaton/json')
			.expect(200)
			.then((data)=>{
				assert.ok(log.getCall(0).args[0] === '[requestHeaders]:'
					&& log.getCall(1).args[0] === '[requestBody]:'
					&& log.getCall(2).args[0] === '[responseBody]:'
					&& log.getCall(3).args[0] === 'POST'
				)
			})
	})
})
