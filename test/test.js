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
	console.log('this is a test')
  ctx.status = 200
  ctx.body = {b: 'passed'}
}

const logMiddleware = logger()

const logMiddleware1 = logger({
		requestHeaders: ['content-type'],
		responseBodyWhiteList: [/player/]
})

const logMiddleware2 = logger({
		requestHeaders: ['content-type'],
		responseHeaders: ['content-type'],
		responseBodyWhiteList: ['/player2']
})

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

  it('player只打印request', async function () {
    await request(server)
			.post('/player')
			.set('content-type', 'application/json')
			.set('host', 'localhost')
			.set('Accept', 'application/json')
      .send({"name":"john"})
			.expect(200)
			.then((data)=>{
				assert.ok(log.getCall(1).args[0] === 'POST')
				assert.ok(log.getCall(1).args[1] === '/player')
				assert.ok(log.getCall(2).args[0]['name'] === 'john')
			})
  })
  it('play1打印requestHeaders中的content-type', async function () {
    await request(server)
			.post('/player1')
			.set('content-type', 'application/json')
      .send({"name":"john"})
			.expect(200)
			.then((data)=>{
				const requestHeaders = log.getCall(2).args[0] 
				assert.ok(requestHeaders === 'content-type: application/json')
			})
  })
  it('/player2打印所有', async function () {
    await request(server)
      .post('/player2')
      .send({"name":"john"})
      .set('content-type', 'application/json')
			.expect(200)
			.then((data)=>{
				assert.ok(log.getCall(6).args[0] === 'content-type: application/json; charset=utf-8')
				assert.ok(log.getCall(7).args[0]['b'] === 'passed')
			})
	})
})