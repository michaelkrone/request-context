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

	describe('context path syntax', function () {

		it('should set and get a property for a path', function (done) {
			const d = domain.create();

			function check() {
				assert.deepEqual(reqContext.getContext('test:value.string'), testValue.string);
				assert.deepEqual(reqContext.getContext('test:async.value.object.property'), testValue.object.property);
			}

			function run() {
				setTimeout(setAsync, 0);
				reqContext.setContext('test:value', testValue);
				setTimeout(check, 0);
				done();
			}

			d.run(run);
		});
	});

});