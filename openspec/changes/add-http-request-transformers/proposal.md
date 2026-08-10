## Why

uWebSockets.js invalidates `HttpRequest` after the first `await` in a route handler. Adapter-agnostic code (for example `@ValidatedBody()`) and user code that read method, URL, headers, or similar after async work therefore break on this adapter. Other adapters (Express, Fastify, Hono) own a stable request object for the whole chain and cannot meaningfully “swap” the request the way uWS needs. The framework needs an opt-in, uWebSockets-specific way to transform/replace the request at the very start of a matched route — before middlewares, guards, and parameter extraction — without taxing routes that do not use it.

## What Changes

- Introduce **request transformers** as a **uWebSockets-only** feature: types and `@UseRequestTransformers(...)` live in `@inversifyjs/http-uwebsockets` and are documented under that adapter only.
- Add `@CaptureRequestValues(...)` as a **method decorator** in the same package. At decorate time it receives `target` / `methodKey`, closes those over a registered `RequestTransformer` (with the selected capture kinds), and resolves controller + method path metadata into route param names **lazily on first transformer invocation**, then caches the names. This avoids decorate-time dependency on `@Controller` (class decorators run after methods) and avoids per-request path parsing or adapter-side options injection.
- In `InversifyUwebSocketsHttpAdapter._buildRouter`, apply transformers with a **build-time fork**: routes with no transformers keep today’s handler shape; routes with transformers run them in the outer route callback (with the same error-filter handling as middlewares), swap the request, then call `handleMiddlewareList` with the transformed request. `handleMiddlewareList` itself is unchanged. Both forks keep `res.onAborted` registration.
- Add minimal core plumbing so `_buildRouter` receives per-route transformers: protected hook + mandatory `RouteParams.requestTransformerList` field whose value may be `undefined` when unused, plus a mandatory `RouteParams.handleError` field exposing the route error filter path to work running outside `handleMiddlewareList`.

## Capabilities

### New Capabilities
- `http-uwebsockets-request-transformers`: uWebSockets request transformer model, `@UseRequestTransformers`, metadata, build-time forked request swap and error handling in `_buildRouter`, and minimal core hook/`RouteParams` plumbing.
- `http-uwebsockets-request-capture`: `@CaptureRequestValues` method decorator that registers a capture transformer closing over class/method identity; param names are derived from path metadata on first use and cached (full snapshots, Proxy, body reuse, docs).

### Modified Capabilities

## Impact

- **Packages modified**: `@inversifyjs/http-uwebsockets` (primary), `@inversifyjs/http-core` (minimal protected hook / `RouteParams` fields only).
- **Public API**: `RequestTransformer`, `@UseRequestTransformers`, `@CaptureRequestValues`, and related capture kinds — all exported from `@inversifyjs/http-uwebsockets`.
- **Not modified for this feature**: Express, Express v4, Fastify, and Hono beyond accepting a `undefined` transformers field if required by shared types.
- **No breaking changes**: Opt-in; undecorated uWS routes behave as today with no per-request transformer overhead.
- **Out of scope**: Universal request transformers on all adapters; changing `handleMiddlewareList`; auto-inferring capture from parameter decorators; `@ValidatedBody` call-order quick fix (separate); transformer lifecycles beyond “before the middleware list”.
