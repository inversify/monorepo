## ADDED Requirements

### Requirement: Global pre-handler middlewares are installed at the application level
The `InversifyHttpAdapter` base class SHALL install pre-handler middlewares registered via `applyGlobalMiddleware(...)` at the application level so that they fire once per request received by the underlying framework, regardless of whether a controller route matches the request. Pre-handler middlewares SHALL NOT be merged into the per-route `RouteParams.preHandlerMiddlewareList` produced for individual controller methods. Global post-handler middlewares are NOT lifted to application level; they continue to fire only for matched routes via the per-route `RouteParams.postHandlerMiddlewareList`, unchanged from the current behavior.

#### Scenario: A global pre-handler middleware does not appear in any RouteParams pre list
- **WHEN** `applyGlobalMiddleware(MyMiddleware)` is called and `build()` completes
- **THEN** every `RouteParams` passed to `_buildRouter` SHALL have a `preHandlerMiddlewareList` whose contents include only route-level middlewares (those declared via per-controller or per-method decorators) — the global pre-handler MUST NOT be present in any per-route pre-handler list

#### Scenario: A global post-handler middleware still appears in RouteParams post list
- **WHEN** `applyGlobalMiddleware(MyMiddleware, { isPostHandler: true })` is called and `build()` completes
- **THEN** every `RouteParams.postHandlerMiddlewareList` SHALL still contain the global post-handler, in the same position as before this change

#### Scenario: A global pre-handler middleware fires on a request to an unmatched path
- **WHEN** `applyGlobalMiddleware(MyMiddleware)` is registered and the application receives a `GET /not-a-route` for which no controller matches
- **THEN** `MyMiddleware.execute` SHALL be invoked exactly once for that request

#### Scenario: A global pre-handler middleware fires on an HTTP verb not declared on a controller
- **WHEN** a controller declares only `@Get('/foo')` and `applyGlobalMiddleware(MyMiddleware)` is registered
- **AND** the application receives an `OPTIONS /foo` request
- **THEN** `MyMiddleware.execute` SHALL be invoked exactly once for that request

### Requirement: Global pre-handler hook on InversifyHttpAdapter
The `InversifyHttpAdapter` base class SHALL declare one protected abstract method:

- `_applyGlobalPreHandlerMiddlewareList(handlerList: MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult>[]): void | Promise<void>`

Adapters SHALL implement this method to register the supplied handlers against the underlying framework's native every-request hook.

The `build()` flow SHALL invoke it as follows:
1. `#bindAdapterRelatedServices()`
2. `await this._applyGlobalPreHandlerMiddlewareList(globalPreHandlers)`
3. `await this.#registerControllers()`
4. mark the adapter as built

`globalPreHandlers` is produced by `#buildGlobalMiddlewareHandlerList(this.#preHandlerMiddlewareList)`.

#### Scenario: build() invokes the hook before route registration
- **WHEN** `build()` is called
- **THEN** `_applyGlobalPreHandlerMiddlewareList` SHALL be invoked exactly once, before any call to `_buildRouter`

#### Scenario: Hook receives handlers in registration order
- **WHEN** `applyGlobalMiddleware(A)` is called, then `applyGlobalMiddleware(B)`, then `build()`
- **THEN** the array passed to `_applyGlobalPreHandlerMiddlewareList` SHALL contain the handler for `A` at index 0 and the handler for `B` at index 1

#### Scenario: Hook is awaited before route registration
- **WHEN** an adapter implementation of `_applyGlobalPreHandlerMiddlewareList` returns a `Promise`
- **THEN** `build()` SHALL await it before invoking `#registerControllers`

### Requirement: No double execution of global pre-handler middlewares on matched routes
A global pre-handler middleware SHALL execute exactly once per request, regardless of whether a route matches. Because the middleware is installed at the application level via `_applyGlobalPreHandlerMiddlewareList`, it MUST NOT also appear in `RouteParams.preHandlerMiddlewareList`. Including it in both would cause double invocation on every matched-route request.

#### Scenario: Global pre-handler runs exactly once on a matched route
- **WHEN** `applyGlobalMiddleware(MyMiddleware)` is registered and a request matches a controller route
- **THEN** `MyMiddleware.execute` SHALL be invoked exactly once for that request

#### Scenario: Handler reference is not shared between app-level and per-route lists
- **WHEN** `build()` completes
- **THEN** no handler object passed to `_applyGlobalPreHandlerMiddlewareList` SHALL appear in any `RouteParams.preHandlerMiddlewareList`

### Requirement: Relative ordering pre-globals → route-pre → guards → handler → route-post is preserved
For a request that matches a controller route, the per-request handler order SHALL be:

1. global pre-handler middlewares (in the order they were registered)
2. route-level pre-handler middlewares (including `routeValueMetadataHandler` first, when present)
3. route-level guards
4. controller method handler (with its interceptors and pipes applied internally)
5. route-level post-handler middlewares followed by global post-handler middlewares (in the order they were registered)

#### Scenario: Matched-route ordering is preserved
- **WHEN** the application is configured with global pre-handler middleware `G1`, route-level pre-handler middleware `R1`, guard `Gd1`, handler `H`, route-level post-handler middleware `R2`, and global post-handler middleware `G2`
- **AND** a request matches the route
- **THEN** the observable invocation order SHALL be `G1`, `R1`, `Gd1`, `H`, `R2`, `G2`

### Requirement: Errors thrown inside global pre-handler middlewares are routed through the global error filter map only
Failures inside a global pre-handler middleware SHALL be processed by `#errorTypeToGlobalErrorFilterMap` only. Route-level error filters (declared via `@UseErrorFilter`) SHALL NOT be consulted, because no route has matched at the point the global middleware runs. The fallback when no filter matches SHALL be `InternalServerErrorHttpResponse` with `cause: error`. If a matched filter throws, the wrapper SHALL recursively invoke the global error handler with the new error.

#### Scenario: Error matches a registered global filter
- **WHEN** a global pre-handler middleware throws an error of class `MyDomainError` and `useGlobalFilters(MyDomainErrorFilter)` was called
- **THEN** `MyDomainErrorFilter.catch(error, request, response)` SHALL be invoked

#### Scenario: Error has no matching filter
- **WHEN** a global pre-handler middleware throws and no filter in `#errorTypeToGlobalErrorFilterMap` matches
- **THEN** the adapter SHALL reply with `InternalServerErrorHttpResponse` whose `cause` is the original error

#### Scenario: Route-level error filter is NOT invoked for global pre-handler middleware errors
- **WHEN** a global pre-handler middleware throws
- **AND** a route-level `@UseErrorFilter(MyRouteFilter)` exists on a controller method
- **THEN** `MyRouteFilter.catch` SHALL NOT be invoked for that error

#### Scenario: Filter itself throws
- **WHEN** a registered global filter's `catch` method throws while handling an error from a global pre-handler middleware
- **THEN** the wrapper SHALL recursively invoke the global error handler with the new error until either a filter succeeds or the fallback `InternalServerErrorHttpResponse` is returned

### Requirement: Global guards, interceptors, and pipes remain route-scoped
This change SHALL NOT alter how `applyGlobalGuards`, `useGlobalInterceptors`, or `useGlobalPipe` are wired. They SHALL continue to apply only when a controller route matches the request.

#### Scenario: Global guards do not run on unmatched routes
- **WHEN** `applyGlobalGuards(MyGuard)` is registered and a request misses every controller route
- **THEN** `MyGuard.activate` SHALL NOT be invoked for that request
