# @inversifyjs/http-instrumentation-core

## 5.8.0

No changes in this release.

## 5.7.0

### Minor Changes

Add optional HTTP instrumentation sinks. Event types and the sink live in `@inversifyjs/http-instrumentation-core`. Adapters emit pipeline events only when at least one sink is configured. The Express 5 adapter also records native middleware, and the Express 5, Fastify, Hono, and uWebSockets adapters record request and response headers and status.
