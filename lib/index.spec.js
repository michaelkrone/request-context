'use strict';

const connect = require('connect');
const assert = require('assert');
const request = require('request');
const domain = require('domain');

const reqContext = require('./index');
const middleware = reqContext.middleware('test');

describe('request-context', function() {
	let testValue;
	let context;

	function setAsync() {
		reqContext.setContext('test:async.value', testValue);
	}

	function setContext(req, res, next) {
		reqContext.set('test:value', testValue);
		setTimeout(function() {
			setAsync();
			next();
		}, 0);
	}

	function getContext(req, res, next) {
		context = reqContext.get('test');
		next();
	}

	function triggerAsyncError() {
		setTimeout(() => woops.thisWillThrow, 0);
	}

	beforeEach(function () {
		testValue = {
			string: 'string',
			object: {
				property: 'property'
			}
		};
	});

	describe('middleware', function () {
		const port = 9009;
		const url = 'http://127.0.0.1:' + port;

		let app;
		let server;

		before(function (done) {
			app = connect()
				.use(middleware)
				.use(setContext)
				.use(getContext);
			server = app.listen(port, done);
		});

		after(function () {
			server.close();
		});

		beforeEach(function (done) {
			request.get(url, done);
		});

		it('should attach a context object', function () {
			assert.deepEqual(context.value, testValue);
		});

		it('should provide access to the context in async functions', function () {
			assert.deepEqual(context.async.value, testValue);
		});

	});

	describe('connection close header', function () {
		const port = 9009;
		const url = 'http://127.0.0.1:' + port;
		let server;

		afterEach(done => server.close(done));

		function setHeader(req, res, next) {
			res.writeHead(200, {'age': '42'});
			return next();
		}

		it('should be sent', function (done) {
			const app = connect()
				.use(middleware)
				.use(triggerAsyncError);

			server = app.listen(port, () => {
				request.get(url, (err, res) => {
					assert.equal(res.headers.connection, 'close');
					done();
				});
			});
		});

		it('should not be sent if a headers has been sent already', function (done) {
			const app = connect()
				.use(middleware)
				.use(setHeader)
				.use(triggerAsyncError);

			server = app.listen(port, () => {
				request.get(url, err => {
					// an error would be thrown if headers are send
					// after the head is written
					assert(err === null);
					done();
				});
			});
		});
	});

	describe('multiple middleware', function () {
		const middleware2 = reqContext.middleware('test2');

		const port = 9009;
		const url = 'http://127.0.0.1:' + port;

		let app;
		let server;
		let contextRoot;
		let context2;
		let testValue2;

		function setAsync2() {
			reqContext.setContext('test2:async.value', testValue2);
		}

		function setContext2(req, res, next) {
			reqContext.set('test2:value', testValue2);
			setTimeout(function() {
				setAsync2();
				next();
			}, 0);
		}

		function getContext2(req, res, next) {
			contextRoot = reqContext.get(null);
			context2 = reqContext.get('test2');
			next();
		}

		before(function (done) {
			app = connect()
				.use(middleware)
				.use(setContext)
				.use(middleware2)
				.use(setContext2)
				.use(getContext)
				.use(getContext2);
			server = app.listen(port, done);
		});

		after(function () {
			server.close();
		});

		beforeEach(function (done) {
			testValue2 = {
				string: 'string2',
				object: {
					property: 'property2'
				}
			};

			request.get(url, done);
		});

		it('first namespace should be available', function () {
			assert.deepEqual(context.value, testValue);
		});

		it('second namespace should be available', function () {
			assert.deepEqual(context2.value, testValue2);
		});

		it('first namespace should be available in async functions', function () {
			assert.deepEqual(context.async.value, testValue);
		});

		it('second namespace should be available in async functions', function () {
			assert.deepEqual(context2.async.value, testValue2);
		});

		it('both namespaces should exist on a single context object', function () {
			assert.ok(contextRoot['test']);
			assert.ok(contextRoot['test2']);
		});

	});

	describe('init only in middleware', function () {
		it('get will return undefined several times in a row', function () {
			assert.deepEqual(reqContext.get('test2'), undefined);
			assert.deepEqual(reqContext.get('test2'), undefined);
			assert.deepEqual(reqContext.get('test2'), undefined);
		});

		it('throws error when not initialized and tries to set', function () {
			assert.throws(() => reqContext.set('test2:yoyo', 'myVal'), /No active context found to set property/);
		});

		it('get returns undefined when running in domain context', function () {
			const d = domain.create();

			d.enter();
			assert.deepEqual(reqContext.get('test2'), undefined);
			assert.deepEqual(reqContext.get('test2'), undefined);
			assert.deepEqual(reqContext.get('test2'), undefined);
			d.exit();
		});

		it('throws error when not initialized and tries to set when running in domain context', function () {
			const d = domain.create();

			d.enter();
			assert.throws(() => reqContext.set('test2:yoyo', 'myVal'), /No active context found to set property/);
			d.exit();
		});
	});

	describe('context path syntax', function () {

		it('should set and get a property for a path', function (done) {
			const d = domain.create();

			function check() {
				assert.deepEqual(reqContext.getContext('test:value.string'), testValue.string);
				assert.deepEqual(reqContext.getContext('test:async.value.object.property'), testValue.object.property);
			}

			function run() {
				// Init context like we do in the middleware
				domain.active.__$cntxt__ = {};

				setTimeout(setAsync, 0);
				reqContext.setContext('test:value', testValue);
				setTimeout(check, 0);
				done();
			}

			d.run(run);
		});
	});

});
