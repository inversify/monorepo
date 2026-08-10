## Purpose

Defines the uWebSockets `@CaptureRequestValues` method decorator that registers a request transformer which snapshots selected request values—including named route params resolved lazily from path metadata using closed-over class/method identity—and exposes them through a Proxy for safe use after await.

## ADDED Requirements

### Requirement: CaptureRequestValues is a method decorator that registers a capture transformer
The `@inversifyjs/http-uwebsockets` package SHALL export `@CaptureRequestValues(...)` as a **method decorator** (not a standalone factory used as `@UseRequestTransformers` input). It SHALL accept an explicit list of request value kinds to capture. When applied, it SHALL receive `target` and `methodKey`, close those over a `RequestTransformer` together with the selected kinds, and register that transformer on the method through the same transformer metadata channel used by `@UseRequestTransformers`. Capture SHALL be manual and opt-in.

#### Scenario: Decorator registers capture before the middleware list
- **WHEN** a controller method is decorated with `@CaptureRequestValues` listing method and headers
- **AND** a request matches that method
- **THEN** a request transformer SHALL capture method and headers before `handleMiddlewareList` runs for that route

#### Scenario: No capture and no other transformers leaves the route unwrapped
- **WHEN** a controller method has no `@CaptureRequestValues` and no `@UseRequestTransformers`
- **THEN** the uWebSockets adapter SHALL NOT wrap that route's request in a capture Proxy

### Requirement: Param names are resolved lazily from path metadata and cached
The capture transformer SHALL close over class/method identity (`target` / `methodKey`) at decorate time but SHALL NOT extract route param names when the decorator is applied (controller path metadata is not available yet because `@Controller` is a class decorator). When params are selected, on the **first** transformer invocation that needs param names, the transformer SHALL read controller path metadata and method path metadata using the closed-over identity, derive the full route path, extract param names once, and cache them on the transformer's closed-over state. Later invocations SHALL reuse the cache and SHALL NOT re-parse the path. The capture transformer SHALL NOT rely on adapter-injected per-route param names in the shared options bag.

#### Scenario: First invocation resolves and caches named params from full path
- **WHEN** a method under `@Controller('/users')` is decorated with `@CaptureRequestValues` including `params` and `@Post('/:userId/items/:itemId')`
- **AND** the capture transformer runs for the first time with params selected
- **THEN** it SHALL resolve param names `userId` and `itemId` from the combined controller + method path
- **AND** it SHALL cache those names for subsequent invocations

#### Scenario: Later invocations reuse the cached param names
- **WHEN** param names have already been resolved and cached for a capture transformer
- **AND** a later request runs that transformer with params selected
- **THEN** the transformer SHALL use the cached names without reading path metadata again

#### Scenario: Missing path metadata at first params resolution fails clearly
- **WHEN** the capture transformer first needs param names and method or controller path metadata cannot be resolved for the closed-over class/method
- **THEN** the implementation SHALL fail fast with an error that indicates path metadata is missing (for example the method lacks an HTTP method decorator)

### Requirement: Selected values are fully snapshotted before any await
The capture transformer SHALL, during its synchronous phase and before any `await`, snapshot every selected kind in full from the native `HttpRequest`:

- **method** — HTTP method string, both lowercased and case sensitive
- **url** — URL, plus the raw query string so that the URL including its query string (the information `_getUrl` exposes) can be served later
- **headers** — all headers (sufficient to serve later per-header reads)
- **query** — all query values (sufficient to serve later per-key and full-query reads)
- **params** — named route parameters using the lazy-cached param names (and optionally index reads consistent with those names), enabling full `getParams()`-style access on the captured request
- **body** — not read in the sync phase; see body requirement

After sync snapshots for non-body kinds, the transformer SHALL return a Proxy (or, if body is selected, a Promise that resolves to that Proxy only after body parsing that does not read the native request again).

#### Scenario: Method and headers are captured before awaiting body
- **WHEN** capture includes method, headers, and body
- **THEN** the transformer SHALL read method and headers from the native request before awaiting body parsing
- **AND** it SHALL NOT call native request methods after that await

#### Scenario: Sync-only capture may return without awaiting
- **WHEN** capture includes only synchronous value kinds
- **THEN** the transformer MAY return the Proxy synchronously without wrapping it in a Promise

#### Scenario: Captured params enable full named params access
- **WHEN** params were captured via `@CaptureRequestValues`
- **AND** later code requests all route parameters or a named parameter through the adapter params accessor / captured request
- **THEN** the call SHALL succeed using the named snapshot and SHALL NOT throw the previous “Getting all route parameters is not supported” error for that captured request

### Requirement: Returned object is a Proxy serving snapshots without native fallback for unselected kinds
The transformed request SHALL be a Proxy. For each selected kind, corresponding request APIs SHALL return data from the snapshot. For APIs belonging to kinds that were not selected, the Proxy SHALL NOT fall back to the native `HttpRequest` after capture completes; it SHALL fail with an error indicating the value was not captured. Own and symbol properties SHALL remain gettable and settable through the Proxy so later stages can attach route-value metadata.

#### Scenario: Captured getMethod works after await
- **WHEN** method was captured
- **AND** later code calls `request.getMethod()` on the transformed request after an await
- **THEN** the call SHALL return the captured method and SHALL NOT throw the native uWebSockets post-await access error

#### Scenario: Captured getHeader uses the full header snapshot
- **WHEN** headers were captured
- **AND** later code calls `request.getHeader('content-type')`
- **THEN** the call SHALL return the corresponding value from the captured headers

#### Scenario: Unselected kind does not touch native request
- **WHEN** only method was captured
- **AND** later code calls an API for an unselected kind (for example `getHeader`)
- **THEN** the call SHALL NOT delegate to the native `HttpRequest`
- **AND** the call SHALL fail with an error that indicates the value was not captured

#### Scenario: Yielding a captured request fails clearly
- **WHEN** later code calls `setYield` on a captured request
- **THEN** the call SHALL NOT delegate to the native `HttpRequest`
- **AND** the call SHALL fail with an error indicating that yielding a captured request is not supported

#### Scenario: Symbol metadata can be attached after swap
- **WHEN** the capture Proxy is the request passed into `handleMiddlewareList`
- **AND** a later stage assigns route-value metadata on a well-known symbol property
- **THEN** a subsequent read of that symbol on the same request object SHALL return the assigned value

### Requirement: Body capture integrates with adapter body reading when selected
When body is included in the capture list, the capture transformer SHALL parse and store the body using the adapter body-parsing path after synchronous native request reads. Subsequent body reads through the adapter options / `_getBody` path for that request SHALL reuse the captured body rather than performing a second native body read. Captured body storage SHALL use a well-defined association with the transformed request (for example a well-known symbol) that `_getBody` recognizes.

#### Scenario: Captured body is reused after await
- **WHEN** body is included in `@CaptureRequestValues`
- **AND** a later parameter decorator requests the body through adapter options
- **THEN** the body value SHALL be the body captured by the transformer

#### Scenario: Body is not captured unless selected
- **WHEN** `@CaptureRequestValues` omits body
- **THEN** the capture transformer SHALL NOT parse the body solely due to capture

### Requirement: Framework-mediated and direct reads observe captures
After capture runs, both direct calls on the transformed request (for selected kinds) and framework-mediated accessors that read through that request (for example `options.getMethod(request)` / `options.getHeaders(request, ...)` / `options.getParams(request)`) SHALL observe the captured values.

#### Scenario: options.getMethod works after await when method was captured
- **WHEN** method was captured via `@CaptureRequestValues`
- **AND** a custom parameter decorator awaits work and then calls `options.getMethod(request)`
- **THEN** the call SHALL succeed and return the captured method

### Requirement: uWebSockets documentation states the manual capture contract
The uWebSockets adapter documentation SHALL describe `@UseRequestTransformers` and `@CaptureRequestValues` as the manual opt-in for safe post-await access to selected request APIs, including that the feature is uWebSockets-specific, that `@CaptureRequestValues` is a method decorator that closes over class/method identity, and that route param names are resolved from path metadata on first use and cached.

#### Scenario: Docs describe lazy-cached param name resolution
- **WHEN** a consumer reads the uWebSockets adapter documentation for request transformers / capture
- **THEN** the docs SHALL describe `@CaptureRequestValues(...)` as a method decorator
- **AND** SHALL explain that param names are resolved from controller + method path metadata on first capture use and then cached
