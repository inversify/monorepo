## 1. Core adapter contract (`@inversifyjs/http-core`)

- [x] 1.1 In [packages/framework/http/libraries/core/src/http/adapter/InversifyHttpAdapter.ts](packages/framework/http/libraries/core/src/http/adapter/InversifyHttpAdapter.ts), remove the global pre-handler concatenation from `#buildRoutePreMiddlewareList`: strip `...this.#getMiddlewareHandlerFromMetadata(routerExplorerControllerMethodMetadata, this.#preHandlerMiddlewareList)` from the method. The result MUST be `[routeValueMetadataHandler?, ...routeMiddlewares]`. The `routeValueMetadataHandler` injection at the front MUST stay. Do NOT modify `#buildRoutePostMiddlewareList` — global post-handler middlewares remain in the per-route post list unchanged.
- [x] 1.2 Add a private helper `#buildGlobalMiddlewareHandlerList(middlewareServiceIdentifierList)` that mirrors `#getMiddlewareHandlerFromMetadata` but uses a global-scoped `handleError` (from `#buildGlobalHandleError()`) instead of the route-scoped one. No `routerExplorerControllerMethodMetadata` argument; no `headerMetadataList`.
- [x] 1.3 Add a private helper `#buildGlobalHandleError()` that produces a `(request, response, error) => Promise<TResult>` consulting only `#errorTypeToGlobalErrorFilterMap`, falling back to `InternalServerErrorHttpResponse` (passing `undefined` for `headerMetadata`). Recursive re-handle for filter-thrown errors, same shape as `#buildHandleError`.
- [x] 1.4 Add one protected abstract method on `InversifyHttpAdapter`: `_applyGlobalPreHandlerMiddlewareList(handlerList: MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[]): void | Promise<void>`.
- [x] 1.5 Modify `InversifyHttpAdapter.build()` to: (a) `#bindAdapterRelatedServices()`; (b) `await this._applyGlobalPreHandlerMiddlewareList(this.#buildGlobalMiddlewareHandlerList(this.#preHandlerMiddlewareList))`; (c) `await this.#registerControllers()`; (d) set `this.#isBuilt = true` and return `this._app`.
- [x] 1.6 Update unit tests for `InversifyHttpAdapter`: (a) after `applyGlobalMiddleware` and `build`, every `RouteParams.preHandlerMiddlewareList` excludes the global pre-handler; (b) `RouteParams.postHandlerMiddlewareList` still includes the global post-handler (post behavior unchanged); (c) `_applyGlobalPreHandlerMiddlewareList` is called exactly once with the handlers in registration order, before any `_buildRouter` call; (d) assert no double execution — no handler reference produced by `#buildGlobalMiddlewareHandlerList` for a given service identifier appears in any `RouteParams.preHandlerMiddlewareList`.
- [x] 1.7 Add unit tests for `#buildGlobalMiddlewareHandlerList` and `#buildGlobalHandleError`: handler invokes the middleware via `container.getAsync`, errors route through global filter map only (route-level filter is NOT consulted), no-filter path falls back to `InternalServerErrorHttpResponse`, recursive re-handle when a filter throws.

## 2. Express adapter (`@inversifyjs/http-express`)

- [x] 2.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/express/src/adapter/InversifyExpressHttpAdapter.ts](packages/framework/http/libraries/express/src/adapter/InversifyExpressHttpAdapter.ts) by iterating `handlerList` and calling `this._app.use(handler as ExpressRequestHandler)` for each. Order MUST match input order.
- [x] 2.2 Add unit tests asserting `app.use` is invoked once per global pre-handler in registration order.

## 3. Express v4 adapter (`@inversifyjs/http-express-v4`)

- [ ] 3.1 Implement `_applyGlobalPreHandlerMiddlewareList` against the v4 `Application` instance, mirroring section 2.
- [ ] 3.2 Add unit tests mirroring section 2.2.

## 4. Fastify adapter (`@inversifyjs/http-fastify`)

- [ ] 4.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/fastify/src/adapter/InversifyFastifyHttpAdapter.ts](packages/framework/http/libraries/fastify/src/adapter/InversifyFastifyHttpAdapter.ts) by registering each handler as a root-level `onRequest` hook (`this._app.addHook('onRequest', adaptedHandler)`). The adapter wraps each `MiddlewareHandler` to translate Fastify's `(request, reply, done)` into the internal `(req, res, next)` shape; await the handler's result and call `done()` on success, or propagate the error to Fastify's error handling.
- [ ] 4.2 Add a note to the adapter's README stating: global pre-handler middlewares run at Fastify's `onRequest` lifecycle stage, before body parsing (`preParsing`). Calling `getBody(request)` inside such a middleware returns `undefined`. Headers, query string, and path params are available.
- [ ] 4.3 Add unit tests asserting `addHook('onRequest', ...)` is invoked once per global pre-handler in registration order.

## 5. Hono adapter (`@inversifyjs/http-hono`)

- [ ] 5.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/hono/src/adapter/InversifyHonoHttpAdapter.ts](packages/framework/http/libraries/hono/src/adapter/InversifyHonoHttpAdapter.ts) by calling `this._app.use(adaptedHandler)` for each handler. Wrap `MiddlewareHandler` into Hono's `(c, next) => Promise<void>` shape: run the user middleware, then `await next()`. The hook MUST be registered before any inner router is mounted via `app.route(...)`, which is naturally satisfied because `build()` invokes `_applyGlobalPreHandlerMiddlewareList` before `#registerControllers`.
- [ ] 5.2 Add unit tests asserting `app.use` is called once per global pre-handler in registration order, and that each `app.use` call precedes any `app.route` call made during `_buildRouter`.

## 6. uWebSockets adapter (`@inversifyjs/http-uwebsockets`)

- [ ] 6.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/uwebsockets/src/adapter/InversifyUwebSocketsHttpAdapter.ts](packages/framework/http/libraries/uwebsockets/src/adapter/InversifyUwebSocketsHttpAdapter.ts) by storing the supplied handler list on the adapter instance (e.g. `this.#globalPreHandlerMiddlewareList = handlerList`).
- [ ] 6.2 In `_buildRouter`, prepend the stored global pre list to each route's handler chain: `[...globalPreHandlers, ...routeParams.preHandlerMiddlewareList, ...routeParams.guardList, routeParams.handler, ...routeParams.postHandlerMiddlewareList]`.
- [ ] 6.3 After `#registerControllers` completes, register a fallback `this._app.any('/*', fallbackHandler)` route whose handler runs the global pre list sequentially and then ends the response with HTTP 404. This ensures global pre-handlers fire for unmatched paths.
- [ ] 6.4 Add unit tests: (a) matched-route global pre-handlers run in correct position before route-level pre-handlers; (b) global pre-handlers run on an unmatched path via the `/*` fallback and the response is 404.
- [ ] 6.5 Document in the adapter's README that uWebSockets has no native global-middleware hook; the implementation chains globals into each route and uses a `/*` fallback for unmatched paths.

## 7. E2E tests (`packages/framework/http/tools/e2e-tests`)

- [ ] 7.1 Add a scenario: a global pre-handler middleware sets the response header `X-Global: 1`. A `GET /not-a-route` request returns 404 with `X-Global: 1` set. Assert for every adapter (`express`, `express-v4`, `fastify`, `hono`, `uwebsockets`).
- [ ] 7.2 Add a scenario reproducing issue [#1837](https://github.com/inversify/monorepo/issues/1837): a controller declares only `@Get('/test-cors')`; a CORS middleware (or a stub that sets `Access-Control-Allow-Origin`) is registered via `applyGlobalMiddleware`; an `OPTIONS /test-cors` request returns 204 with the CORS headers. Assert for `express`, `express-v4`, `fastify`, `hono`.

## 8. Migration notes

- [ ] 8.1 Add a CHANGELOG entry on every modified adapter package: global pre-handler middlewares (registered via `applyGlobalMiddleware` without `isPostHandler: true`) now fire at the application level for every request, including unmatched paths and HTTP verbs not declared on controllers. Users who relied on the previous scoping must move that middleware to per-route registration (`@UseMiddleware`).
- [ ] 8.2 Add a CHANGELOG note: errors thrown inside a global pre-handler middleware are now handled only by filters registered via `useGlobalFilters`. Route-level `@UseErrorFilter` filters are not consulted because no route has matched when the global middleware runs.
- [ ] 8.3 Add a CHANGELOG note for `@inversifyjs/http-fastify`: global pre-handler middlewares run at Fastify's `onRequest` stage, before body parsing. Calling `getBody(request)` in such a middleware returns `undefined`.
- [ ] 8.4 Add or update a section in the http-core README describing the new contract and pointing users to `@UseMiddleware` for per-route scope.

## 9. Verification

- [ ] 9.1 Run `pnpm run --filter "@inversifyjs/http-core" test`.
- [ ] 9.2 Run `pnpm run --filter "@inversifyjs/http-express" test` and equivalents for `http-express-v4`, `http-fastify`, `http-hono`, `http-uwebsockets`.
- [ ] 9.3 Run `pnpm run --filter "@inversifyjs/http-e2e-tests" test` (or the package name in use) covering the new scenarios.
- [ ] 9.4 Run `pnpm run lint && pnpm run format`.
- [ ] 9.5 Run `pnpm run build`.
- [ ] 9.6 Manually verify the issue #1837 reproduction: `curl -I -X OPTIONS http://localhost:3000/test-cors -H 'Origin: http://localhost:3000'` returns 204 with CORS headers when the controller declares only `@Get`.
