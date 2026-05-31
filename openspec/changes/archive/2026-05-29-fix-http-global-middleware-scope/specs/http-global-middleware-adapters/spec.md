## ADDED Requirements

### Requirement: Express adapters install global pre-handler middlewares via app.use
`InversifyExpressHttpAdapter` and `InversifyExpressV4HttpAdapter` SHALL implement `_applyGlobalPreHandlerMiddlewareList` by invoking `this._app.use(handler)` for each handler in registration order. Because `build()` invokes the hook before route registration, the `app.use` calls land before any `app.get/post/...` registrations; Express's middleware ordering ensures they run for every request, including 404s and arbitrary verbs.

#### Scenario: Pre-handler globals are installed before any route registration
- **WHEN** `applyGlobalMiddleware(MyMiddleware)` is registered and `build()` runs
- **THEN** `app.use(handlerForMyMiddleware)` SHALL be invoked before any `app.get/post/...` call made during `_buildRouter`

#### Scenario: Globals fire on a 404
- **WHEN** an Express-backed application has `applyGlobalMiddleware(LoggerMiddleware)` registered and receives a request to a path with no controller route
- **THEN** `LoggerMiddleware.execute` SHALL be invoked exactly once for that request

#### Scenario: Globals fire on OPTIONS preflight against a GET-only route
- **WHEN** a controller declares only `@Get('/foo')` and `applyGlobalMiddleware(CorsMiddleware)` is registered
- **AND** an `OPTIONS /foo` request arrives
- **THEN** `CorsMiddleware.execute` SHALL be invoked exactly once for that request

### Requirement: Fastify adapter installs global pre-handler middlewares via onRequest hook
`InversifyFastifyHttpAdapter` SHALL implement `_applyGlobalPreHandlerMiddlewareList` by registering each handler as a root-level `onRequest` lifecycle hook (`this._app.addHook('onRequest', adaptedHandler)`). The adapter SHALL translate Fastify's `(request, reply, done)` signature to the framework-internal `MiddlewareHandler` shape, awaiting promise-returning handlers.

**Body availability constraint**: Fastify's `onRequest` hook fires after routing (path params are populated) but before body parsing (`preParsing`). Any global pre-handler middleware that calls `getBody(request)` will receive `undefined`. Headers, query parameters, and path parameters are available. This constraint is a Fastify lifecycle limitation and MUST be documented in the adapter README.

#### Scenario: onRequest hook count matches global pre-handler count
- **WHEN** two pre-handler globals are registered via `applyGlobalMiddleware`
- **THEN** `app.addHook('onRequest', ...)` SHALL be called exactly twice during `build()`, once per handler, in registration order

#### Scenario: Globals fire on a 404
- **WHEN** a Fastify-backed application has a global pre-handler middleware registered and receives a request to a path with no controller route
- **THEN** the global middleware SHALL execute as part of Fastify's `onRequest` lifecycle for that request

#### Scenario: Globals fire on OPTIONS preflight against a GET-only route
- **WHEN** a controller declares only `@Get('/test-cors')` and `applyGlobalMiddleware(CorsMiddleware)` is registered
- **AND** an `OPTIONS /test-cors` request arrives
- **THEN** `CorsMiddleware.execute` SHALL be invoked exactly once for that request (regression scenario from issue [#1837](https://github.com/inversify/monorepo/issues/1837))

#### Scenario: Body is unavailable in global pre-handler middleware on Fastify
- **WHEN** a global pre-handler middleware calls `getBody(request)` on a Fastify-backed application
- **THEN** the return value SHALL be `undefined`, because the `onRequest` hook fires before Fastify's body-parsing stage

### Requirement: Hono adapter installs global pre-handler middlewares via app.use
`InversifyHonoHttpAdapter` SHALL implement `_applyGlobalPreHandlerMiddlewareList` by calling `this._app.use(adaptedHandler)` for each handler in registration order. Each handler is wrapped into Hono's `(c, next) => Promise<void>` signature with pre-handler semantics: run the user middleware, then `await next()`. The pre-hook MUST be registered before any inner router is mounted via `app.route(...)`, which is naturally achieved by `build()`'s ordering.

#### Scenario: Pre-globals are registered before any inner router mount
- **WHEN** a Hono-backed application is built with one global pre-handler middleware and at least one controller
- **THEN** `app.use(adaptedHandlerFor(globalMiddleware))` SHALL be invoked before any `app.route(...)` call made during `_buildRouter`

#### Scenario: Globals fire on OPTIONS preflight against a GET-only route
- **WHEN** a controller declares only `@Get('/test-cors')` and `applyGlobalMiddleware(CorsMiddleware)` is registered
- **AND** an `OPTIONS /test-cors` request arrives
- **THEN** `CorsMiddleware.execute` SHALL be invoked exactly once for that request (regression scenario from issue [#1837](https://github.com/inversify/monorepo/issues/1837))

### Requirement: uWebSockets adapter implements global pre-handler middlewares via per-route chaining and a fallback route
`InversifyUwebSocketsHttpAdapter` SHALL implement `_applyGlobalPreHandlerMiddlewareList` by storing the supplied handler list on the adapter instance. `_buildRouter` SHALL prepend those stored handlers before each route's per-route handler chain. Additionally, after all controllers are registered, the adapter SHALL register a fallback `app.any('/*', handler)` route whose handler runs the global pre list sequentially and then ends the response with HTTP 404, so global pre-handlers fire on unmatched paths.

The adapter README SHALL document that uWebSockets.js does not expose a native global-middleware hook and that this implementation is a best-effort workaround via per-route chaining and a `/*` fallback.

#### Scenario: Matched-route global pre-handler execution
- **WHEN** a request matches a controller route on a uWebSockets-backed application with one global pre-handler middleware registered
- **THEN** the global pre-handler SHALL run before the route's per-route pre-handler middlewares

#### Scenario: Unmatched-route fallback runs pre-globals
- **WHEN** a request hits a path with no matching controller route on a uWebSockets-backed application
- **THEN** the fallback `/*` route SHALL execute the registered global pre-handler middlewares and then end the response with HTTP 404

#### Scenario: Fallback registration happens after all controllers
- **WHEN** `build()` runs on the uWebSockets adapter
- **THEN** the fallback `app.any('/*', ...)` SHALL be registered after all `#registerControllers` calls have completed, so that more specific controller routes are evaluated first by the uWebSockets dispatcher
