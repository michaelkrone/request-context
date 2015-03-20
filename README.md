Simple connect middleware for accessing data in a request context.
Wrap the request handling in a domain and set and access data for the current request lifecycle only.
All following functions will be run in the created 'namespace'.

## The problem
You would like to access data from the request or any middleware in a completely different context.
Due to the async architecture of Node it can become a nightmare to pass the data to all callbacks
is the function chain. This module provides a middleware and an easy to use API to access data
from anywhere in the function chain. No matter if the functions are called async or not.

See the [Domain Docs](https://nodejs.org/api/domain.html) for further information on error handling
for domains.

## Install

```sh
$ npm install request-context
```

## Example

server config in app.js:
```js
var app = express();
var contextService = require('request-context');

// wrap requests in the 'request' namespace (can be any string)
app.use(contextService.middleware('request'));

// set the logged in user in some auth middleware
app.use(function (req, res, next) {
	User.findById(req.cookies._id, function (err, user) {
		// set the user who made this request on the context
		contextService.setContext('request:user', user);
		next();
	});
});

// save a model in put requests
app.put(function (req, res, next) {
	new Model(req.body).save(function (err, doc) {
		res.json(doc);
	});
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
	this.modifiedBy = contextService.getContext('request:user.name');
	// or	this.userName = contextService.getContext('request').user.name;
	next();
});
```

## API

- `middleware`
Returns a function that can be used as connect middleware. Takes a string as the name of the namespace as its argument. All functions called after this middleware, async or not, will have read/write access to the context.
```js
var middleware = require('request-context').middleware;
app.use(middleware('some namespace'));
```

- `setContext`
Set the context for a key
```js
var contextService = require('request-context');
contextService.setContext('namespace:key', {some: 'value'});
```

- `getContext`
Get the context for a key
```js
var contextService = require('request-context');
contextService.getContext('namespace:key.some'); // returns 'value'
```
