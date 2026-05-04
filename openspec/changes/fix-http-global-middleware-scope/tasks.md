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

## 3. Express v4 adapter (`@inversifyjs/http-express-v4`)

- [x] 3.1 Implement `_applyGlobalPreHandlerMiddlewareList` against the v4 `Application` instance, mirroring section 2.

## 4. Fastify adapter (`@inversifyjs/http-fastify`)

- [x] 4.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/fastify/src/adapter/InversifyFastifyHttpAdapter.ts](packages/framework/http/libraries/fastify/src/adapter/InversifyFastifyHttpAdapter.ts) by registering each handler as a root-level `onRequest` hook (`this._app.addHook('onRequest', adaptedHandler)`). The adapter wraps each `MiddlewareHandler` to translate Fastify's `(request, reply, done)` into the internal `(req, res, next)` shape; await the handler's result and call `done()` on success, or propagate the error to Fastify's error handling.
- [x] 4.2 Update docs stating: global pre-handler middlewares run at Fastify's `onRequest` lifecycle stage, before body parsing (`preParsing`). Calling `getBody(request)` inside such a middleware returns `undefined`. Headers, query string, and path params are available.

## 5. Hono adapter (`@inversifyjs/http-hono`)

- [x] 5.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/hono/src/adapter/InversifyHonoHttpAdapter.ts](packages/framework/http/libraries/hono/src/adapter/InversifyHonoHttpAdapter.ts) by calling `this._app.use(adaptedHandler)` for each handler. Wrap `MiddlewareHandler` into Hono's `(c, next) => Promise<void>` shape: run the user middleware, then `await next()`. The hook MUST be registered before any inner router is mounted via `app.route(...)`, which is naturally satisfied because `build()` invokes `_applyGlobalPreHandlerMiddlewareList` before `#registerControllers`.

## 6. uWebSockets adapter (`@inversifyjs/http-uwebsockets`)

- [x] 6.1 Implement `_applyGlobalPreHandlerMiddlewareList` in [packages/framework/http/libraries/uwebsockets/src/adapter/InversifyUwebSocketsHttpAdapter.ts](packages/framework/http/libraries/uwebsockets/src/adapter/InversifyUwebSocketsHttpAdapter.ts) by storing the supplied handler list on the adapter instance (e.g. `this.#globalPreHandlerMiddlewareList = handlerList`).
- [x] 6.2 In `_buildRouter`, prepend the stored global pre list to each route's handler chain: `[...globalPreHandlers, ...routeParams.preHandlerMiddlewareList, ...routeParams.guardList, routeParams.handler, ...routeParams.postHandlerMiddlewareList]`.
- [x] 6.3 After `#registerControllers` completes, register a fallback `this._app.any('/*', fallbackHandler)` route whose handler runs the global pre list sequentially and then ends the response with HTTP 404. This ensures global pre-handlers fire for unmatched paths.
- [x] 6.5 Update docs stating that uWebSockets has no native global-middleware hook; the implementation chains globals into each route and uses a `/*` fallback for unmatched paths.

## 7. E2E tests (`packages/framework/http/tools/e2e-tests`)

- [ ] 7.1 Add a scenario: a global pre-handler middleware sets the response header `X-Global: 1`. A `GET /not-a-route` request returns 404 with `X-Global: 1` set. Assert for every adapter (`express`, `express-v4`, `fastify`, `hono`, `uwebsockets`).
- [ ] 7.2 Add a scenario reproducing issue [#1837](https://github.com/inversify/monorepo/issues/1837): a controller declares only `@Get('/test-cors')`; a CORS middleware (or a stub that sets `Access-Control-Allow-Origin`) is registered via `applyGlobalMiddleware`; an `OPTIONS /test-cors` request returns 204 with the CORS headers. Assert for `express`, `express-v4`, `fastify`, `hono`.


## 8. Verification

- [ ] 8.1 Run `pnpm run --filter "@inversifyjs/http-core" test`.
- [ ] 8.2 Run `pnpm run --filter "@inversifyjs/http-express" test` and equivalents for `http-express-v4`, `http-fastify`, `http-hono`, `http-uwebsockets`.
- [ ] 8.3 Run `pnpm run --filter "@inversifyjs/http-e2e-tests" test` (or the package name in use) covering the new scenarios.
- [ ] 8.4 Run `pnpm run lint && pnpm run format`.
- [ ] 8.5 Run `pnpm run build`.
- [ ] 8.6 Manually verify the issue #1837 reproduction: `curl -I -X OPTIONS http://localhost:3000/test-cors -H 'Origin: http://localhost:3000'` returns 204 with CORS headers when the controller declares only `@Get`.
