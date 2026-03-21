## Context

The InversifyJS HTTP framework provides a decorator-driven system for defining controllers, routes, middleware, guards, and interceptors. Metadata set by decorators (e.g., `@Get`, `@ApplyMiddleware`) is collected by a router explorer, packed into `RouterExplorerControllerMethodMetadata`, converted to `RouteParams`, and handed to each adapter's `_buildRouter` which registers routes with the underlying HTTP framework.

Currently, there is no mechanism for users to attach custom key-value metadata to a route and retrieve it from within middleware at request time. The metadata pipeline stops at framework-provided concerns (guards, interceptors, status codes, headers).

### Key constraints

- Five adapters exist: Express, Express v4, Fastify, Hono, uWebSockets.
- Each adapter registers routes differently (Express uses `app.get(path, ...handlers)`, Fastify uses `app.get(path, handler)`, Hono uses nested routers, etc.).
- Existing metadata storage uses `reflect-metadata` via `@inversifyjs/reflect-metadata-utils`.

## Goals / Non-Goals

**Goals:**
- Allow users to create decorator/getter pairs for arbitrary route-level metadata via a simple factory function.
- Plumb route value metadata through the existing router explorer → `RouteParams` → `_buildRouter` pipeline.
- Each supported adapter (Express, Express v4, Fastify, Hono, uWebSockets) can populate the metadata on the request so it is available in middleware.
- Provide type-safe retrieval: `getRoles(request)` returns `string[] | undefined`.

**Non-Goals:**
- Runtime metadata mutation (metadata is set at registration time, read-only at request time).
- Controller-class-level metadata (only method-level; class metadata can be composed separately).

## Decisions

### 1. Metadata storage on the controller class

**Decision:** Store route value metadata on the controller constructor using `reflect-metadata` with a dedicated metadata key. The metadata structure is a `Map<string | symbol, Map<string | symbol, unknown>>` where the outer key is the controller method key and the inner key is the user-provided metadata identifier (e.g., `'ROLES'`).

**Rationale:** This mirrors existing patterns (`controllerMethodMetadataReflectKey`, `classMethodMiddlewareMetadataReflectKey`) and uses the same `updateOwnReflectMetadata` utility. Storing on the constructor (not the prototype) is consistent with how other method-level metadata is stored.

**Alternatives considered:**
- Storing on the method descriptor: discarded because the project consistently stores metadata on the constructor.
- Using a WeakMap keyed by method reference: discarded because reflect-metadata is the established pattern.

### 2. Metadata flow through the pipeline

**Decision:** Extend `RouterExplorerControllerMethodMetadata` with a mandatory `routeValueMetadataMap: Map<string | symbol, unknown>` field. Extend `RouteParams` with a mandatory `routeValueMetadataMap: Map<string | symbol, unknown> | undefined` field. Internal data structures never use optional properties — the field is always present, but its value may be `undefined` when no metadata exists. The base `InversifyHttpAdapter` populates both during route building.

**Rationale:** This follows the established pipeline where decorator metadata flows through the router explorer into `RouteParams`. Mandatory fields make it explicit that every code path must handle the field, avoiding accidental omissions. No new data channels are needed.

### 3. Adapter-specific metadata injection via a new protected method

**Decision:** Add a new protected method to `InversifyHttpAdapter`:

```ts
protected _getRouteValueMetadataHandler(
  routeValueMetadataMap: Map<string | symbol, unknown>,
): MiddlewareHandler<TRequest, TResponse, TNextFunction, TResult> | undefined;
```

The default implementation returns `undefined` (no-op). Each adapter overrides it to return a middleware that populates the metadata on the request object. The base adapter prepends this middleware to the route's pre-handler list when the map is non-empty.

**Rationale:** This keeps `_buildRouter` unchanged and lets each adapter opt-in to route value metadata support.

**Alternatives considered:**
- Passing metadata through `RouteParams` and letting each `_buildRouter` handle it: viable but would require modifying all five `_buildRouter` implementations and the `RouteParams` interface. The middleware approach is less invasive.
- Using a global middleware that looks up a path-keyed map: discarded because route path matching (with path parameters) is complex and error-prone.

### 4. Request-level metadata storage via a well-known symbol

**Decision:** Define a `Symbol` (e.g., `routeValueMetadataSymbol`) in `@inversifyjs/http-core`. Each adapter's middleware sets `request[routeValueMetadataSymbol] = metadataMap`. The getter function reads from this symbol property.

**Rationale:** Symbols avoid collisions with user properties. A shared symbol in the core package lets getter functions from any adapter read from a consistent location.

**Express/Express v4:** `req[routeValueMetadataSymbol] = metadataMap`
**Fastify:** `request[routeValueMetadataSymbol] = metadataMap`
**Hono:** Context-based storage using Hono's `c.set()` / `c.get()` pattern, with the getter adapted to read from the Hono context.
**uWebSockets:** `req[routeValueMetadataSymbol] = metadataMap` (attached to the request wrapper/object passed through the pipeline)

### 5. Public API: adapter-specific factory functions

**Decision:** Each adapter package exports a `create<Framework>RouteValueMetadataUtils<T>(key: string | symbol)` function that returns a `[decorator, getter]` tuple.

```ts
// Express
const [Roles, getRoles] = createExpressRouteValueMetadataUtils<string[]>('ROLES');

// Fastify
const [Roles, getRoles] = createFastifyRouteValueMetadataUtils<string[]>('ROLES');

// uWebSockets
const [Roles, getRoles] = createUwebsocketsRouteValueMetadataUtils<string[]>('ROLES');
```

The decorator is framework-agnostic (it only sets reflect-metadata). The getter function is framework-specific (it reads from the framework's request type).

**Rationale:** Framework-specific getters provide correct typings (`express.Request` vs `FastifyRequest`). The decorator is identical across frameworks but is bundled with the getter in the same factory for ergonomic usage.

**Alternatives considered:**
- A single generic factory in core with adapter-provided getter: this would require users to import from two packages and manually wire them, reducing ergonomics.

### 6. Hono adapter uses context variables instead of request symbol

**Decision:** Hono's request object (`HonoRequest`) is a thin wrapper that doesn't support arbitrary properties as cleanly. Instead, the Hono adapter uses Hono's built-in `c.set(key, value)` / `c.get(key)` context variable API. The Hono getter function takes a `Context` instead of `HonoRequest`.

**Rationale:** Hono's `Context` is the idiomatic way to pass per-request data. This aligns with Hono conventions and existing Hono adapter patterns.

## Risks / Trade-offs

- **[Symbol property on request objects]** → Some frameworks may seal/freeze request objects in future versions. Mitigation: the symbol approach is widely used in the Express/Fastify ecosystem and is unlikely to break. Hono uses its native context API instead.

- **[Metadata only available after middleware injection]** → If a custom parameter decorator or native handler accesses the request before the route value metadata middleware runs, the metadata won't be available. Mitigation: the metadata middleware is prepended to the pre-handler list, so it runs before any user-defined middleware, guards, or the handler.

- **[Breaking type change on RouteParams]** → Adding a mandatory `routeValueMetadataMap` to `RouteParams` will break custom adapters that construct `RouteParams` manually. Mitigation: this is an internal interface, not part of the public API. Custom adapter authors must add the field (set to `undefined` if unsupported).
