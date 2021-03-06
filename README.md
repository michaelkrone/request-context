# request-context
Simple connect middleware for accessing data in a request context.
Wrap the request handling in a domain and set and access data for the current request lifecycle only.
All following functions will be run in the created 'namespace'.

**See the [Domain Docs](https://nodejs.org/api/domain.html) for further information on error handling
for domains. Note that the domain module is pending deprecation!**

## The problem
You would like to access data from the request or any middleware in a completely different context.
Due to the async architecture of Node it can become a nightmare to pass the data to all callbacks
is the function chain. This module provides a middleware and an easy to use API to access data
from anywhere in the function chain. No matter if the functions are called async or not.

## Install

```sh
$ npm install request-context
```

## Example

server config in app.js:
```js
const app = express();
const contextService = require('request-context');

// wrap requests in the 'request' namespace (can be any string)
app.use(contextService.middleware('request'));

// set the logged in user in some auth middleware
app.use(function (req, res, next) {
	User.findById(req.cookies._id, (err, user) => {
		// set the user who made this request on the context
		contextService.set('request:user', user);
		next();
	});
});

// save a model in put requests
app.put(function (req, res, next) {
	new Model(req.body).save((err, doc) => res.json(doc));
});

// always use an default express/connect error handling middleware
// it will be called if any errors occur in the domain
// see http://expressjs.com/en/guide/error-handling.html
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
});

// start server etc.
[...]
```

In the Model definition file:
```js
var contextService = require('request-context');

[...]

// set the user who made changes to this document
// note that this method is called async in the document context
modelSchema.pre('save', function (next) {
	// access the user object which has been set in the request middleware
	this.modifiedBy = contextService.get('request:user.name');
	// or this.modifiedBy = contextService.get('request').user.name;
	next();
});
```

## API

Also available on [the github pages](http://michaelkrone.github.io/request-context/).

- `middleware`
Returns a function that can be used as connect middleware. Takes a string as the name of the namespace as its argument. All functions called after this middleware, async or not, will have read/write access to the context.
```js
var middleware = require('request-context').middleware;
app.use(middleware('some namespace'));
```

- `set`, `setContext`
Set the context for a key on the context created by the middleware.
```js
var contextService = require('request-context');
contextService.set('namespace:key', {some: 'value'});
contextService.set('namespace:key.some', 'other');
```

- `get`, `getContext`
Get the context for a key on the context created by the middleware.
```js
var contextService = require('request-context');
contextService.get('namespace:key.some'); // returns 'other'
```

## Object Path Syntax
Any value from the context object can be accessed by a simple object dot notation:

```js
var contextService = require('request-context');

// set an object on the namespace
contextService.set('namespace:character',	{
		name: 'Arya Stark',
		location: {
			name: 'Winterfell',
			region: 'North'
		}
	});

// this will return the complete object
var char = contextService.get('namespace:character');

// work with the object
var region = char.location.region;

// this will return 'Arya Stark'
contextService.get('namespace:character.name');

// this will set the region to 'Westeros'
contextService.set('namespace:character.location.region', 'Westeros');

```

## Documentation

The documentation is available on [the github pages](http://michaelkrone.github.io/request-context/).
To generate the jsdoc documentation run
```bash
$ gulp docs
```

## Test

To run the packaged tests:
```bash
$ gulp test
```

