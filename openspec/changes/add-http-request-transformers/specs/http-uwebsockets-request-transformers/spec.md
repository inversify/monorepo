## Purpose

Defines uWebSockets-only request transformers: opt-in handlers that run at the start of a matched route, may replace the request object, and are registered via decorators exported from the uWebSockets adapter package.

## ADDED Requirements

### Requirement: Request transformers are a uWebSockets adapter feature
Request transformers SHALL be provided by `@inversifyjs/http-uwebsockets`. The package SHALL export a `RequestTransformer` type and a `@UseRequestTransformers(...)` method decorator. Documentation for this feature SHALL live under the uWebSockets adapter. Other HTTP adapters SHALL NOT be required to execute request transformers.

#### Scenario: Public API is imported from the uWebSockets package
- **WHEN** a consumer registers request transformers on a controller method
- **THEN** the consumer SHALL import `@UseRequestTransformers` from `@inversifyjs/http-uwebsockets` (not from `@inversifyjs/http-core`)

### Requirement: UseRequestTransformers registers transformers on a controller method
`@UseRequestTransformers(...)` SHALL attach one or more request transformer functions to a controller method in declaration order. Applying no transformer-related decorator SHALL leave the method without transformers. Transformers SHALL be opt-in and method-scoped.

#### Scenario: Decorator registers transformers in declaration order
- **WHEN** `@UseRequestTransformers(T1, T2)` is applied to a controller method
- **THEN** the uWebSockets adapter SHALL resolve transformers for that method in the order `T1`, then `T2`

#### Scenario: Method without transformer decorators has no transformers
- **WHEN** a controller method has neither `@UseRequestTransformers` nor `@CaptureRequestValues`
- **THEN** the uWebSockets adapter SHALL treat that method as having no transformers (`undefined` for routing purposes)

### Requirement: RequestTransformer replaces the request for the remainder of the uWS chain
A `RequestTransformer` SHALL receive the current request, response, and adapter-provided options needed to read request data (including body when required), and SHALL return the same request or a replacement request (synchronously or via a Promise). After transformers complete, the uWebSockets adapter SHALL pass the final request into `handleMiddlewareList` so every subsequent handler in that list observes it.

#### Scenario: Transformer return value is used by later handlers
- **WHEN** a transformer returns request object `R2` different from the native request `R1`
- **THEN** middlewares, guards, route-value metadata injection, parameter extraction, and the controller handler invoked via `handleMiddlewareList` for that route SHALL observe `R2`

#### Scenario: Asynchronous transformers are awaited before the middleware list
- **WHEN** a transformer returns a Promise that resolves to a request
- **THEN** the adapter SHALL await that Promise before invoking `handleMiddlewareList` with the resolved request

#### Scenario: Synchronous transformers may return without a Promise
- **WHEN** a transformer returns a request value directly (not a Promise)
- **THEN** the adapter SHALL use that value as the next request without requiring the transformer to wrap it in a Promise

### Requirement: Build-time fork installs transformers only when present
`InversifyUwebSocketsHttpAdapter` route registration SHALL specialize handlers at build time:

- If resolved transformers are absent (`undefined`), the registered route callback SHALL match today’s shape: register `onAborted`, then invoke `handleMiddlewareList` with the native request (no transformer loop, no emptiness check on the hot path).
- If transformers are present, the registered route callback SHALL register `onAborted`, run transformers first (sequentially, swapping the request), then invoke `handleMiddlewareList` with the transformed request.

`handleMiddlewareList` itself SHALL NOT gain transform/swap options for this feature.

#### Scenario: Absent transformers keep the current handler shape
- **WHEN** a route has no request transformers and the uWebSockets adapter registers the route
- **THEN** the registered callback SHALL NOT run a request-transformer loop and SHALL call the middleware runner with the native request

#### Scenario: Present transformers run before handleMiddlewareList
- **WHEN** a route has one or more request transformers
- **AND** a request matches that route
- **THEN** those transformers SHALL run to completion before `handleMiddlewareList` is invoked
- **AND** `handleMiddlewareList` SHALL receive the transformed request

#### Scenario: Both forks register onAborted
- **WHEN** the uWebSockets adapter registers a route with or without transformers
- **THEN** the registered callback SHALL register `response.onAborted` before awaiting route work, preserving abort tracking behavior

#### Scenario: handleMiddlewareList API remains unchanged for transform support
- **WHEN** this feature is implemented
- **THEN** request swap SHALL NOT be implemented by adding transform options to `handleMiddlewareList`

### Requirement: Transformers run before globals and all per-route stages in the middleware list
On a matched uWebSockets route with transformers, transformers SHALL execute in the outer route callback before the ordered middleware list that includes global pre-handlers, route-value metadata injection, route pre-handlers, guards, the controller handler, and post-handlers.

#### Scenario: Transformers precede global pre-handlers chained into the route
- **WHEN** a route has a request transformer `RT` and a global pre-handler middleware `G` that is chained into the route's ordered handler list
- **THEN** `RT` SHALL complete before `G` receives the request

#### Scenario: Later stages see the transformed request
- **WHEN** a transformer replaces the request with `R2`
- **AND** a subsequent middleware in the list reads its request argument
- **THEN** that middleware SHALL receive `R2`

### Requirement: Multiple transformers compose by sequential swap
When multiple transformers are registered, the adapter SHALL invoke them sequentially in registration order. Each transformer SHALL receive the request produced by the previous one. The final request SHALL be passed to `handleMiddlewareList`.

#### Scenario: Second transformer receives the first transformer output
- **WHEN** transformers `T1` and `T2` are registered in that order
- **AND** `T1` returns request `R1`
- **THEN** `T2` SHALL be invoked with `R1`

### Requirement: Transformer errors use the same handling path as middleware errors
When a request transformer throws or returns a rejected Promise, the uWebSockets adapter SHALL handle that error through the same error-filter path used for middleware failures on that route (route-level filters when present, otherwise global filters / internal server error fallback). Transformer failures SHALL NOT be left as unhandled rejections on the bare route callback.

#### Scenario: Transformer throw is handled by error filters
- **WHEN** a request transformer throws an error of a type that has a matching error filter for the route
- **THEN** that error filter SHALL be invoked
- **AND** `handleMiddlewareList` SHALL NOT proceed with the remaining chain for that attempt

#### Scenario: Transformer rejection is handled like a throw
- **WHEN** a request transformer returns a Promise that rejects
- **THEN** the adapter SHALL handle the rejection through the same error-filter path as a thrown error

### Requirement: Minimal core plumbing supports per-route resolution without exporting the feature from core
`@inversifyjs/http-core` SHALL provide only the plumbing required for the uWebSockets adapter to receive per-route transformers through `RouteParams`: a protected resolver hook defaulting to `undefined`, a **mandatory** transformers field on `RouteParams` whose value MAY be `undefined` when unused, and a **mandatory** route error handler field on `RouteParams` so an adapter can route failures happening outside the middleware list through the route error filters. `@inversifyjs/http-core` SHALL NOT export `@UseRequestTransformers` or `@CaptureRequestValues`.

#### Scenario: Core default resolves to undefined transformers
- **WHEN** a non-uWebSockets adapter builds routes
- **THEN** the transformers field on each `RouteParams` entry SHALL be `undefined`

#### Scenario: Core exposes the route error handler on route params
- **WHEN** core builds route params for a controller method
- **THEN** each `RouteParams` entry SHALL expose an error handler applying the route error filters, then the global error filters, then the internal server error fallback

#### Scenario: Core does not export the uWebSockets decorators
- **WHEN** a consumer inspects the public exports of `@inversifyjs/http-core`
- **THEN** `@UseRequestTransformers` and `@CaptureRequestValues` SHALL NOT be among those exports
