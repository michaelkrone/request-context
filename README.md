# request-context
Simple connect middleware for accessing data in a request context.
Wrap the request/response loop in a namespace wrapper (by using node's domain system).
All following functions will be run in the created namespace.
