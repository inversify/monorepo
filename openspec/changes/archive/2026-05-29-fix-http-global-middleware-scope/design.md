## Context

`InversifyHttpAdapter` is the abstract base class that every HTTP adapter (`express`, `express-v4`, `fastify`, `hono`, `uwebsockets`) extends. It owns:

- `#preHandlerMiddlewareList` / `#postHandlerMiddlewareList` — populated by `applyGlobalMiddleware`.
- `#globalGuardList`, `#globalInterceptorList`, `#globalPipeList` — populated by `applyGlobalGuards`, `useGlobalInterceptors`, `useGlobalPipe`.
- `#errorTypeToGlobalErrorFilterMap` — populated by `useGlobalFilters`.

In `build()`, after `#bindAdapterRelatedServices()`, `#registerControllers()` walks every controller method and produces a `RouteParams` per method via `#buildRouteParamHandlerList`. Inside that method:

- `#buildRoutePreMiddlewareList(metadata)` returns `[...routeValueMetadataHandler?, ...handlersFor(this.#preHandlerMiddlewareList), ...handlersFor(metadata.preHandlerMiddlewareList)]`.
- `#buildRoutePostMiddlewareList(metadata)` returns `[...handlersFor(this.#postHandlerMiddlewareList), ...handlersFor(metadata.postHandlerMiddlewareList)]`.

Each adapter's `_buildRouter` attaches those lists per route. Result: global pre-handler middlewares run only when a controller route matches the request.

The fix lifts global pre-handler middlewares to the application level so they fire for every request — including requests that miss every controller (404s) and `OPTIONS` preflights against routes that declare only `GET` (#1837). Global post-handler middlewares are intentionally left per-route; post-handler semantics require a matched handler and have no equivalent for unmatched requests.

Constraints we want to preserve:

- Existing public API: `applyGlobalMiddleware`, `applyGlobalGuards`, `useGlobalInterceptors`, `useGlobalPipe`, `useGlobalFilters`. No new public methods. No signature changes.
- The `pre-build vs post-build` invariant on global registration (already enforced via `#isBuilt` checks).
- The `#routeValueMetadataHandler` injection point — it is a per-route concern (stamps `request[routeValueMetadataSymbol]` for the matched route) and MUST stay first in the route-level pre-handler list.
- No double execution: a global pre-handler middleware MUST appear either at the app level OR in the per-route chain, never both. This requires removing it from `#buildRoutePreMiddlewareList`.

## Goals / Non-Goals

**Goals:**
- A global pre-handler middleware registered via `applyGlobalMiddleware(...)` runs once per request at the application level, before any route matcher decides whether a controller route matches.
- The relative order pre-globals → route-pre → guards → handler → route-post is unchanged for matched routes.
- Each adapter wires the new hook to its underlying framework's native global registration mechanism so every request the framework dispatches (matched or not) flows through global pre-handler middlewares.
- Failures inside global pre-handler middleware go through `#errorTypeToGlobalErrorFilterMap`. No route-level error filter is consulted because no route has matched.
- Issue [#1837](https://github.com/inversify/monorepo/issues/1837) becomes a covered regression scenario.

**Non-Goals:**
- Lifting global post-handler middlewares to app level. Post-handler middlewares continue to fire only for matched routes. Users needing app-level response processing should use the underlying framework's native response hooks directly.
- Promoting global guards / interceptors / pipes to app level. They are coupled to the controller method by design.
- Adding a new `useGlobal*` API or any other surface. The fix is internal.
- Changing how `applyGlobalMiddleware` accepts `ApplyMiddlewareOptions`. Only *where* the resulting pre-handlers are installed changes.
- Providing a workaround for body access in Fastify global pre-handler middlewares. The `onRequest` stage fires before body parsing; this is a Fastify lifecycle constraint that is documented but not papered over.

## Decisions

### 1. One new protected abstract hook on `InversifyHttpAdapter`

**Decision**: Add

```typescript
protected abstract _applyGlobalPreHandlerMiddlewareList(
  handlerList: MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[],
): void | Promise<void>;
```

`InversifyHttpAdapter.build()` calls it in this order:

1. `#bindAdapterRelatedServices()`
2. `await this._applyGlobalPreHandlerMiddlewareList(globalPreHandlers)`
3. `await this.#registerControllers()`
4. `this.#isBuilt = true`

Returning `void | Promise<void>` accommodates Fastify's plugin-registration model (which is async).

No `_applyGlobalPostHandlerMiddlewareList` is introduced. Post-handler global middlewares remain in `#buildRoutePostMiddlewareList` and continue to fire only for matched routes, exactly as today.

**Rationale**: A single hook covers the entire fix. The asymmetry (pre at app level, post at route level) is intentional. Pre-handler middlewares are input processors that should observe every request; post-handler middlewares are response processors whose logic is meaningful only relative to a matched handler. Introducing a post-handler hook would require per-framework workarounds (Fastify's `onResponse` fires after the connection is flushed, Express has no "after every route" hook for response bodies) with limited practical benefit.

**Alternatives considered**:
- *Two hooks (pre + post)*: rejected — no correct app-level equivalent for "after the handler" exists across all frameworks without introducing per-framework complexity that does not benefit users who rely on post-handler semantics.
- *Provide a default no-op implementation*: rejected — silently dropping global pre-handler middlewares on adapters that have not implemented the hook would re-introduce the bug. Forcing every adapter to implement the hook makes the contract explicit at compile time.

### 2. `#buildGlobalMiddlewareHandlerList` mirrors `#getMiddlewareHandlerFromMetadata` minus route metadata

**Decision**: Introduce a private helper:

```typescript
#buildGlobalMiddlewareHandlerList(
  middlewareServiceIdentifierList: ServiceIdentifier<
    Middleware<TRequest, TResponse, TNextFunction, TResult>
  >[],
): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[]
```

It produces the same `async (req, res, next) => { try { ... } catch (e) { return globalHandleError(req, res, e) } }` wrapper, but the error path uses a global-only `handleError` built from `#errorTypeToGlobalErrorFilterMap` (no route-level filter map, no `headerMetadataList`).

The global `handleError` reuses `getErrorFilterForError(this.#container, error, [this.#errorTypeToGlobalErrorFilterMap])` and falls back to `InternalServerErrorHttpResponse` — passing `undefined` for `headerMetadata` since no controller method metadata exists at the global layer.

**Rationale**: Reuses the proven middleware wrapper without adding logic that depends on per-route metadata. Errors thrown by global pre-handler middlewares are scoped to the global filter map only; route-level `@UseErrorFilter` declarations are not consulted. This is an accepted and documented trade-off.

### 3. Global pre-handler middlewares MUST be stripped from `#buildRoutePreMiddlewareList`

**Decision**: `#buildRoutePreMiddlewareList` SHALL no longer concatenate `this.#preHandlerMiddlewareList`. The route-level pre list becomes `[routeValueMetadataHandler?, ...routeMiddlewares]` only.

`#buildRoutePostMiddlewareList` is **unchanged**: it still concatenates `this.#postHandlerMiddlewareList` followed by route-level post middlewares.

**Rationale**: If global pre-handler middlewares are installed at the app level AND also included in the per-route chain, they execute twice for every matched-route request. Double execution is incorrect regardless of middleware purpose (logging emits duplicate entries, authentication performs redundant token lookups, CORS headers are set twice). The strip is the mandatory counterpart to app-level installation. Tests MUST assert no handler produced for a global middleware service identifier appears in any `RouteParams.preHandlerMiddlewareList`.

### 4. Per-adapter implementations

**Decision** per adapter:

- **`@inversifyjs/http-express` & `@inversifyjs/http-express-v4`**: implement `_applyGlobalPreHandlerMiddlewareList` by calling `this._app.use(handler)` for each handler in registration order. Because `build()` invokes the hook before `#registerControllers`, the `app.use` calls land before any `app.get/post/...` registrations, which is how Express middleware ordering works. Express middlewares registered with `app.use(handler)` run for every request, including 404s and arbitrary verbs.

- **`@inversifyjs/http-fastify`**: implement `_applyGlobalPreHandlerMiddlewareList` by registering each handler as a root-level `onRequest` hook (`this._app.addHook('onRequest', adaptedHandler)`). Fastify's `onRequest` fires for every request after routing (path params are populated) but **before body parsing**. The hook adapter translates Fastify's `(request, reply, done)` into the internal `MiddlewareHandler` signature, awaiting the handler and calling `done()` on success. **Body limitation**: `request.body` is `undefined` at `onRequest` stage — any global pre-handler middleware calling `_getBody(request)` will receive `undefined` on Fastify. This is a known Fastify lifecycle constraint; it is documented in the adapter README and in migration notes, and is not worked around.

- **`@inversifyjs/http-hono`**: implement `_applyGlobalPreHandlerMiddlewareList` by calling `this._app.use(adaptedHandler)` for each handler. Hono runs `app.use` middlewares for every request. The wrapper calls the user middleware and then `await next()` (pre-handler semantics). Pre-hooks are registered before the controllers' inner routers via `app.route(...)` by virtue of `build()`'s ordering.

- **`@inversifyjs/http-uwebsockets`**: uWebSockets.js has no native "every request" hook. Implement `_applyGlobalPreHandlerMiddlewareList` by storing the handler list on the adapter instance. In `_buildRouter`, prepend the stored list before each route's handler chain. After `#registerControllers` completes, register a fallback `this._app.any('/*', fallbackHandler)` whose handler runs the global pre list and ends the response with HTTP 404, so unmatched paths also execute the global pre-handlers. This is a pragmatic workaround documented in the adapter README.

**Alternatives considered**:
- *`@fastify/middie` for Fastify*: rejected because middie calls handlers with `(req.raw, res.raw, next)` — `http.IncomingMessage` and `http.ServerResponse` — rather than the `FastifyRequest`/`FastifyReply` wrappers that all adapter methods target. Every `_setHeader`, `_replyJson`, `_getBody` call would crash or silently produce wrong values. `addHook('onRequest', ...)` is strictly superior.
- *Catch-all `/*` wildcard for all adapters*: rejected — Fastify and Hono return 405 before evaluating the wildcard when a path matches an existing route but the method does not, which would fail to fix issue #1837 on those adapters.

### 5. Error handling at the global layer

**Decision**: `#buildGlobalMiddlewareHandlerList` constructs an error handler that:

1. Looks up filters in `#errorTypeToGlobalErrorFilterMap` only.
2. If a filter is found, invokes `errorFilter.catch(error, request, response)`, recursively handling errors thrown by the filter.
3. If no filter is found, calls `#printError(error)` and replies with `new InternalServerErrorHttpResponse(undefined, undefined, { cause: error })` via `#reply` — passing `undefined` for `headerMetadata`.

Route-level `@UseErrorFilter` declarations are not consulted. Users who want error handling for errors thrown by global pre-handler middlewares must use `useGlobalFilters`.

### 6. Tests

**Decision**:

- Unit tests on `InversifyHttpAdapter`: (a) after `applyGlobalMiddleware` and `build`, every `RouteParams.preHandlerMiddlewareList` excludes global pre-handlers; (b) `RouteParams.postHandlerMiddlewareList` still includes global post-handlers (unchanged); (c) `_applyGlobalPreHandlerMiddlewareList` is called exactly once with handlers in registration order, before any `_buildRouter` invocation; (d) no handler produced for a global pre-handler service identifier appears in any `RouteParams.preHandlerMiddlewareList` (double-execution guard).
- Adapter unit tests assert the framework-native registration call (`app.use` for express, `addHook('onRequest', ...)` for fastify, `app.use` for hono).
- E2E tests: (i) global pre-handler sets `X-Global: 1`; `GET /not-a-route` returns 404 with the header; (ii) controller declares only `@Get('/test-cors')`; CORS middleware registered via `applyGlobalMiddleware`; `OPTIONS /test-cors` returns 204 with CORS headers (issue #1837).

## Risks / Trade-offs

- **[Behavioral change for pre-handler middlewares]** Users who unintentionally depended on global pre-handler middlewares NOT running for unmatched routes will see new behavior. This is intentional and called out in the proposal. Users wanting per-route scope should use `@UseMiddleware` instead.
- **[Fastify body unavailability]** Global pre-handler middlewares on Fastify run at `onRequest` stage, before body parsing. Any middleware reading `getBody(request)` will receive `undefined`. This is a Fastify lifecycle constraint, documented but not worked around.
- **[Error filter scope change]** Errors thrown inside a global pre-handler middleware are handled only by `useGlobalFilters` filters. Route-level `@UseErrorFilter` filters do not apply. Migration notes must call this out explicitly.
- **[Post-handler globals remain per-route]** Post-handler middlewares registered via `applyGlobalMiddleware` still only fire on matched routes. Their behavior is unchanged from before.
- **[uWebSockets adapter parity]** uWebSockets requires the `/*` fallback workaround. Global pre-handlers fire for matched routes (via `_buildRouter` chaining) and for unmatched paths (via the fallback). This is a best-effort implementation documented in the adapter README.
- **[Hono ordering]** Hono evaluates `app.use(...)` calls in registration order relative to `app.route(...)`. The `build()` flow naturally honors this (pre before `#registerControllers`), but it is fragile to refactoring. A test asserts the order to lock it in.
