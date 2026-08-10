## Context

See proposal.md — Why.

`InversifyUwebSocketsHttpAdapter._buildRouter` builds an ordered handler list (globals, route pre-handlers including route-value metadata, guards, controller handler, post-handlers) and runs it via `handleMiddlewareList(req, res)`. That helper always passes the same request reference through the chain. Express registers handlers on its own stack and likewise cannot replace `req` mid-chain.

uWebSockets is therefore the only adapter where an outer route callback can legally replace the request object before the Inversify chain runs. Request transformers are designed for that adapter only.

Middleware, guards, and the controller handler already wrap execution in `try/catch` and route failures through error filters. Transformers run outside that list in the outer callback, so the fork must apply the same error-handling path explicitly.

A plain `captureRequestValues(kinds)` **factory** that returns a `RequestTransformer` cannot know which class/method it belongs to: it runs as an argument expression before any method decorator receives `target` / `methodKey`, so it cannot later look up path metadata. Named params therefore require a **method decorator** that closes over `target` / `methodKey` so the transformer can resolve (and cache) param names when it first runs — after `@Controller` and HTTP method decorators have all written metadata.

## Goals / Non-Goals

**Goals:**
- Ship **request transformers** as a first-class uWebSockets feature (naming kept; docs and public API live under that adapter).
- Swap request **outside** `handleMiddlewareList`, before globals and all per-route stages.
- **Build-time specialization**: undecorated routes use the current handler shape with zero transformer work at request time.
- Provide `@CaptureRequestValues(...)` as a method decorator that registers a capture transformer closing over `target` / `methodKey` / kinds; resolve controller + method path into param names on first invocation and cache them (not recomputed every request).
- Handle transformer errors the same way middleware errors are handled (error filters).

**Non-Goals:**
- Request transformers on Express, Express v4, Fastify, or Hono.
- Changing `handleMiddlewareList` to support swap options.
- A factory-only capture API that cannot close over class/method identity (and thus cannot look up path metadata later).
- Auto-applying capture from `@ValidatedBody` or other param decorators.
- Making transformer/capture decorators `@inversifyjs/http-core` exports.
- Optional lifecycles beyond “before the middleware list”.

## Decisions

### 1. Keep the name; narrow the home

**Decision:** The feature is still called **request transformers**. Public types, `@UseRequestTransformers`, and `@CaptureRequestValues` live in `@inversifyjs/http-uwebsockets` and are documented only for that adapter.

### 2. Build-time fork in `_buildRouter`; leave `handleMiddlewareList` alone

**Decision:** When registering a route:

```ts
const run = handleMiddlewareList(orderedHandlers);

if (requestTransformerList === undefined) {
  app.<method>(path, async (res, req) => {
    res.onAborted(() => { /* abortedSymbol */ });
    await run(req, res);
  });
} else {
  app.<method>(path, async (res, req) => {
    res.onAborted(() => { /* abortedSymbol */ });

    let request = req;

    try {
      for (const t of requestTransformerList) {
        request = await t(request, res, options);
      }
    } catch (error) {
      await routeParams.handleError(request, res, error);

      return;
    }

    await run(request, res);
  });
}
```

The empty list check happens when resolving transformers, so `_buildRouter` only checks `undefined`.

Both forks MUST register `res.onAborted` like today.

### 3. Minimal core plumbing: mandatory field, value may be `undefined`

**Decision:** Core does **not** export the uWS decorators. It only:

1. Adds a protected hook on `InversifyHttpAdapter`, `_resolveRequestTransformerList(controllerMetadata, methodMetadata)`, defaulting to `undefined`.
2. Attaches the result on `RouteParams` as a **mandatory** `requestTransformerList` field whose type allows `undefined` when unused.
3. Attaches the route error handler on `RouteParams` as a **mandatory** `handleError` field. Route error filters live inside the per-handler closures built by core, so without this field an adapter cannot reuse the middleware error path for work happening outside `handleMiddlewareList`.
4. Exports the `RequestTransformer` type plus the `RouterExplorerControllerMetadata` / `RouterExplorerControllerMethodMetadata` types used by the hook signature, so adapters outside the package can override it.
5. Lets `InversifyUwebSocketsHttpAdapter` override the hook to read uWebSockets transformer metadata (from `@UseRequestTransformers` and/or `@CaptureRequestValues`) and implement the build-time fork in `_buildRouter`.

### 4. Execution order: before the entire `handleMiddlewareList` chain

**Decision:** Transformers run in the outer uWS route callback before `run(request, res)`.

### 5. Transformer errors use the same filter path as middleware

**Decision:** The transformers branch wraps the transform loop so thrown/rejected errors go through the same route + global error filter handling used when middleware fails.

### 6. `@CaptureRequestValues` is a method decorator; param names are lazy-cached

**Decision:** Export `@CaptureRequestValues(kinds)` as a method decorator. When applied, it:

1. Receives `target` and `methodKey`.
2. Creates a `RequestTransformer` that closes over `kinds`, `target`, and `methodKey` (use `target.constructor` when looking up class-level controller metadata).
3. Registers that transformer on the method via the same transformer metadata channel as `@UseRequestTransformers`.

**Param name resolution (lazy + cached):**  
`@Controller` is a class decorator and runs **after** method decorators, so controller path is not available at capture decorate time. Therefore the capture transformer SHALL NOT extract param names when the decorator is applied. Instead, on the **first** invocation that needs params (typically the first request that runs the transformer with `params` selected):

1. Read method path metadata and controller path metadata using the closed-over class/method identity.
2. Build the full route path, extract param names (e.g. `:userId`).
3. Cache those names on the transformer’s closed-over state.
4. Use the cache on all later invocations (no per-request path parsing).

If path metadata is still missing at that first resolution (e.g. no HTTP method decorator on the method), fail fast with a clear error.

Concurrent first invocations MAY compute names twice; that is acceptable if idempotent.

Users write:

```ts
@Controller('/users')
class UsersController {
  @CaptureRequestValues(['method', 'headers', 'params', 'body'])
  @Post('/:userId/items/:itemId')
  create(...) {}
}
```

**Why not a factory?**  
`captureRequestValues(kinds)` as an argument to `@UseRequestTransformers` never receives `target`/`methodKey`, so it cannot later look up path metadata for that method. The method decorator exists to close over class/method identity.

**Capture kinds:**

`RequestValueKind` is the string literal union `'body' | 'headers' | 'method' | 'params' | 'query' | 'url'`, so kinds read as `@CaptureRequestValues(['method', 'headers'])` without importing an enum. Selecting `'url'` also captures the raw query string, since `_getUrl` composes the URL with it.

**Capture transformer behavior:**

1. Synchronously snapshots selected kinds from the native `HttpRequest` (full headers, raw query string, method and case sensitive method, URL, params using cached names via `getParameter(name)`).
2. Optionally awaits body parsing if body is selected (only after sync snapshots).
3. Returns a **Proxy** that serves those snapshots.
4. Does not fall back to native `HttpRequest` for unselected kinds; fails clearly instead. `setYield` also fails clearly, since yielding a route is only meaningful while the native request is alive.
5. Forwards own/symbol property get/set so route-value metadata still works.

Body is stored for `_getBody` / options `getBody` reuse via a well-known association on the transformed request.

Sync-only capture MAY return the Proxy directly without awaiting.

**Params:** Cached names enable named maps and `getParams()`-style access on the captured request, lifting the current “all params unsupported” limitation for captured requests.

### 7. Manual opt-in DX

**Decision:** Users annotate with `@UseRequestTransformers` and/or `@CaptureRequestValues`. No auto-inference from parameter decorators.

### 8. Transformer registration (v1)

**Decision:** `@UseRequestTransformers` accepts transformer **functions** in v1. `@CaptureRequestValues` registers one function internally. DI service identifiers MAY come later.

## Risks / Trade-offs

- **[Missing HTTP method decorator]** → First params resolution cannot find path metadata. Mitigation: clear error at first capture that needs params.
- **[First-request param-name computation]** → One-time cost (and possible duplicate concurrent computes). Mitigation: cache after first resolution; optional warm-up at `build()` is allowed but not required.
- **[uWS-only feature with a shared RouteParams field]** → Other adapters carry `undefined`. Mitigation: default `undefined`.
- **[Incomplete kind selection]** → Unselected kind APIs fail clearly. Mitigation: docs.
- **[Body capture before auth]** → Explicit body kind.
- **[Symbol forwarding bugs]** → Proxy get/set tests for symbols.

## Migration Plan

1. Minimal core hook + mandatory `RouteParams` field (`T | undefined`).
2. uWS `@UseRequestTransformers` + `_buildRouter` build-time fork with error handling and `onAborted` on both forks.
3. `@CaptureRequestValues` decorator + lazy-cached param names + Proxy + body reuse + docs.
4. Existing apps unchanged until they opt in.

Rollback: remove decorator usage; additive feature.

## Resolved Questions

- **Capture kind names:** `'body'`, `'headers'`, `'method'`, `'params'`, `'query'` and `'url'`, as a string literal union named `RequestValueKind`.
- **`RouteParams` field name:** `requestTransformerList`, matching the `...List` naming used by the other `RouteParams` fields.
- **Stacking order:** transformers are appended to the method metadata as decorators are applied, so stacked `@UseRequestTransformers` / `@CaptureRequestValues` run in decorator application order (bottom-up), consistent with `@UseGuard` and `@ApplyMiddleware`.
- **Param-name cache warm-up:** names are resolved on first use, not at `build()` time, since `@CaptureRequestValues` owns the transformer and the adapter never inspects it.
