---
"@inversifyjs/http-core": minor
"@inversifyjs/http-express": minor
"@inversifyjs/http-express-v4": minor
"@inversifyjs/http-fastify": minor
"@inversifyjs/http-hono": minor
"@inversifyjs/http-instrumentation-core": minor
"@inversifyjs/http-uwebsockets": minor
---

Add optional HTTP instrumentation sinks. Event types and the sink live in `@inversifyjs/http-instrumentation-core`. Adapters emit pipeline events only when at least one sink is configured. The Express 5 adapter also records native middleware, and the Express 5, Fastify, Hono, and uWebSockets adapters record request and response headers and status.
