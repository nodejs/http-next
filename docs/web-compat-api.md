# Web Comapt API Design

Status: DRAFT

This doc will be a scratch pad to work out the high level api which focuses on web api compat. This includes apis based on the WHATWG `Request` and `Resonse` apis and other similar
areas.

## Request APIs

https://fetch.spec.whatwg.org/#request-class

NOTE: All fields from the spec listed so we can decide if all make sense in the Node.js context, we should fill in each with that context. Additionally, because this spec is client oriented, it is not expected that the server side work in the same way. 

### `new Request(RequestInit)`

**`RequestInit.method`**

**`RequestInit.headers`**

**`RequestInit.body`**

**`RequestInit.referrer`**

**`RequestInit.referrerPolicy`**

**`RequestInit.mode`**

**`RequestInit.credentials`**

**`RequestInit.cache`**

**`RequestInit.redirect`**

**`RequestInit.integrity`**

**`RequestInit.keepalive`**

**`RequestInit.signal`**

**`RequestInit.duplex`**

**`RequestInit.priority`**

**`RequestInit.window`**

---

### `request.method`

### `request.url`

### `request.headers`

### `request.destination`

### `request.referrer`

### `request.referrerPolicy`

### `request.mode`

### `request.credentials`

### `request.cache`

### `request.redirect`

### `request.integrity`

### `request.keepalive`

### `request.isReloadNavigation`

### `request.isHistoryNavigation`

### `request.signal`

### `request.duplex`

### `request.clone()`


---

## APIs from popular frameworks

### Header Helpers: `request.getHeader()`, `request.setHeader()`

### Cookie Helpers: `request.cookies`

### Cache Helpers: `request.fresh`, `request.stale`, 

### Proxy/IP Helpers: `request.ip`, `request.ips`

### URL Helpers: `request.protocol`, `request.hostname`, `request.path`, `request.query`

### Content Negotiation: `request.contentType()`, `request.is()`, `request.accepts()`, `request.acceptsCharsets()`, `request.acceptsEncodings()`, `request.acceptsLanguages()`

### Range Header Helpers: `request.range()`



## Response APIs

https://fetch.spec.whatwg.org/#response-class

NOTE: All fields from the spec listed so we can decide if all make sense in the Node.js context, we should fill in each with that context. Additionally, because this spec is client oriented, it is not expected that the server side work in the same way. 

### `new Response(BodyInit, ResponseInit)`

### `responseInit.status`

### `responseInit.statusText`

### `responseInit.headers`

--- 

### `response.error()`

### `response.redirect(url, status)`

### `response.json(data, ResponseInit)`

### `response.type`

### `response.url`

### `response.redirected`

### `response.status`

### `response.ok`

### `response.statusText`

### `response.headers`

### `response.clone()`

---

## APIs from popular frameworks

### Status Helpers: `response.status()`, `response.code()`, `response.sendStatus()`

### Header Helpers: `response.setHeader()`, `response.getHeader()`

### Cookie Helpers: `response.cookie()`, `response.clearCookie()`

### Redirect Helpers: `response.redirect()`, `response.location()`

### Body Helpers: `response.json()`, `response.jsonp()`, `response.attachment()`, `response.download()`, `response.format()`, `response.send()`, `response.sendFile()`
