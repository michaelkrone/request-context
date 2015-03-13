[![NPM Version][npm-image]][npm-url]

Simple connect middleware for accessing data in a request context.
Wrap the request handling in a domain and set and access data for the current request lifecycle only.
All following functions will be run in the created 'namespace'.

## Install

```sh
$ npm install request-context
```

## Example

express server config in app.js:
```js
var app = express();
var contextService = require('request-context');

// wrap requests in the 'request' namespace (can be any string)
app.use(contextService.middleware('request'));

// set the logged in user in some auth middleware
app.use(function (req, res, next) {
	User.findById(req.user._id, function (err, user) {
		// set the user who made this request
		contextService.setContext('request:user', user);
		next();
	});
});

// save a model in put requests
app.put(function (req, res, next) {
	Model.save(req.body, next);
});

// start server etc.
[...]
```

In the Model definition file:
```js
var contextService = require('request-context');

// set the user who made changes to this document
modelSchema.pre('save', function (next) {
	// access the user object which has been send by the 
	this.userName = contextService.getContext('request:user.name');
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
Set the context for a key:
```js
contextService.setContext('namespace:key', {some: value});
```

- `getContext`
Get the context for a key:
```js
contextService.getContext('namespace:key.some.value'); // returns {some: value}
```
