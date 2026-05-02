## Why

`InversifyHttpAdapter.applyGlobalMiddleware()` is documented as registering global middleware, but the current implementation in [packages/framework/http/libraries/core/src/http/adapter/InversifyHttpAdapter.ts](packages/framework/http/libraries/core/src/http/adapter/InversifyHttpAdapter.ts) merges those middlewares into the per-route `preHandlerMiddlewareList` / `postHandlerMiddlewareList` of every controller method (see `#buildRoutePreMiddlewareList` and `#buildRoutePostMiddlewareList`). Each adapter (`express`, `express-v4`, `fastify`, `hono`, `uwebsockets`) then attaches them as route-scoped handlers.

The consequence is that "global" pre-handler middlewares only run when an explicit controller route matches the request. They do not run for:

- CORS preflight `OPTIONS` requests against routes that only declare other verbs (issue [#1837](https://github.com/inversify/monorepo/issues/1837)).
- Requests to unknown paths (404s), where developers reasonably expect logging, CORS, request-id, or error-mapping middleware to still execute.
- Any other pattern where middleware needs to observe traffic the controller layer has not explicitly opted into.

The user-facing contract of `applyGlobalMiddleware` should match every other HTTP framework's notion of "global middleware": pre-handler middlewares run once per request at the application level, regardless of route matching, in the order they were registered.

## What Changes

- **Stop merging global pre-handler middlewares into per-route lists.** `InversifyHttpAdapter.#buildRoutePreMiddlewareList` SHALL only emit route-level (controller- and method-scoped) middleware handlers. Global pre-handler middlewares MUST be stripped from it to prevent double execution once they are also installed at the app level.
- **`#buildRoutePostMiddlewareList` is unchanged.** Global post-handler middlewares remain per-route. Post-handler semantics are tightly coupled to the matched handler; there is no meaningful app-level "post-handler" phase for unmatched requests.
- **Add one new app-level installation step in `InversifyHttpAdapter.build()`.** Before `#registerControllers()` runs, the base adapter SHALL invoke a new abstract hook `_applyGlobalPreHandlerMiddlewareList(handlers)` so each adapter can register the global pre-handler middlewares against the application instance (`app.use`, `addHook`, etc.).
- **Build app-level middleware handlers with global error scoping.** The base adapter SHALL provide a `#buildGlobalMiddlewareHandlerList(serviceIdentifierList)` helper that mirrors `#getMiddlewareHandlerFromMetadata` but uses an error handler scoped only to `#errorTypeToGlobalErrorFilterMap`. Route-level `@UseErrorFilter` filters are not consulted because no route has matched.
- **Preserve relative ordering for matched routes.** The effective per-request handler order MUST remain unchanged:
  1. global pre-handler middlewares (registration order)
  2. route-level pre-handler middlewares
  3. route-level guards
  4. controller handler (with its interceptors and pipes)
  5. route-level post-handler middlewares followed by global post-handler middlewares (unchanged)
- **Update every adapter** (`express`, `express-v4`, `fastify`, `hono`, `uwebsockets`) to implement `_applyGlobalPreHandlerMiddlewareList` using the framework-native global registration mechanism.
- **Keep global guards, global interceptors, and global pipes per-route.** They are coupled to the controller method by design. This change does not touch them.
- **Update the e2e test harness** in `packages/framework/http/tools/e2e-tests` to cover the new contract: a global pre-handler middleware MUST execute on unmatched-path requests and on `OPTIONS` preflights against single-verb routes.

## Capabilities

### New Capabilities
- `http-global-middleware-core`: Defines the contract that global pre-handler middlewares (registered via `applyGlobalMiddleware`) execute at the application level for every request, regardless of route matching. Introduces one new abstract hook on `InversifyHttpAdapter`. Documents the double-execution prevention requirement and the error-filter scope change.
- `http-global-middleware-adapters`: Defines, per adapter, how global pre-handler middlewares are wired against the underlying framework's native global hook so they fire for unmatched routes and unmapped HTTP verbs.

## Impact

- **Modified package**: `@inversifyjs/http-core` — one new abstract method on `InversifyHttpAdapter`, two new private helpers (`#buildGlobalMiddlewareHandlerList`, `#buildGlobalHandleError`), a one-step change to `build()`, and the removal of global pre-handler concatenation from `#buildRoutePreMiddlewareList`. `RouteParams` struct is unchanged; `postHandlerMiddlewareList` contents are unchanged.
- **Modified packages**: `@inversifyjs/http-express`, `@inversifyjs/http-express-v4`, `@inversifyjs/http-fastify`, `@inversifyjs/http-hono`, `@inversifyjs/http-uwebsockets` — each implements `_applyGlobalPreHandlerMiddlewareList` against its underlying framework's native global hook.
- **Behavioral change (intentional)**: A global pre-handler middleware registered via `applyGlobalMiddleware` will now fire for requests that previously did not reach it (unmatched paths, `OPTIONS` preflights against single-verb routes, etc.). Users who relied on the prior — incorrect — scoping must move that middleware to per-route registration (`@UseMiddleware`) instead.
- **Error filter scope change (intentional)**: Errors thrown inside a global pre-handler middleware are now handled only by `useGlobalFilters` filters. Route-level `@UseErrorFilter` declarations are not consulted.
- **Fastify body limitation (documented)**: On Fastify, global pre-handler middlewares run at the `onRequest` lifecycle stage, before body parsing. Calling `getBody(request)` in such a middleware returns `undefined`.
- **No new public API on the controller side**: `applyGlobalMiddleware` keeps its signature and remains pre-`build()` only. `useGlobalGuards`, `useGlobalInterceptors`, `useGlobalPipe`, `useGlobalFilters` are untouched.
- **Tests**: Adapter unit tests gain coverage for the new hook. E2E tests gain scenarios for unmatched-route and OPTIONS-preflight global middleware execution. Issue [#1837](https://github.com/inversify/monorepo/issues/1837) is the canonical regression case.
