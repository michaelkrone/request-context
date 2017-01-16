## v2.0.0 (2017-01-16)

### Breaking Changes
- Node.js >=5 only
- [PR#18](https://github.com/michaelkrone/request-context/pull/18): Getting/setting values will now affect the request context only.
Existing domains are not used anymore. This breaks if your code accessed values in domains not created by the middleware.
See the [pull request](https://github.com/michaelkrone/request-context/pull/18) for further details.

### Changes
- add linting
- updated docs and README
- started changelog :)
