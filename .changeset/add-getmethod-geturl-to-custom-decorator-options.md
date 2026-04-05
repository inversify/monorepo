---
'@inversifyjs/http-core': minor
---

Added `getMethod` and `getUrl` methods to `CustomParameterDecoratorHandlerOptions` interface (and by extension `CustomNativeParameterDecoratorHandlerOptions`). These methods allow custom parameter decorators to access the HTTP method and request URL in a framework-agnostic way.
