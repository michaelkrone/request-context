'use strict';

var connect = require('connect');
var assert = require('assert');
var request = require('request');
var domain = require('domain');

var reqContext = require('./index');
var middleware = reqContext.middleware('test');

describe('request-context', function() {
	var testValue;


	function setAsync() {
		reqContext.setContext('test:async.value', testValue);
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
		var port = 9009;
		var url = 'http://localhost:' + port;

		var app;
		var server;
		var context;

		function setContext(req, res, next) {
			reqContext.set('test:value', testValue);
			setTimeout(setAsync, 0);
			next();
		}

		function getContext(req, res, next) {
			context = reqContext.get('test');
			next();
		}


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

	describe('context path syntax', function () {

		it('should set and get a property for a path', function (done) {
			var d = domain.create();

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