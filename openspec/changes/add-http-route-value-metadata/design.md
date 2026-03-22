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

### 5. Public API: per-adapter factory functions

**Decision:** Each adapter package exports its own `createRouteValueMetadataUtils` function that returns a `[decorator, getter]` tuple. The `@inversifyjs/http-core` package exports a base implementation whose getter reads from `request[routeValueMetadataSymbol]`. Adapters that store metadata on the request object (Express, Express v4, Fastify, uWebSockets) re-export the core function as-is. Adapters that use a different storage mechanism (Hono uses `Context`) provide a custom implementation with a getter tailored to their storage.

```ts
// Express / Express v4 / Fastify / uWebSockets — re-export of core
import { createRouteValueMetadataUtils } from '@inversifyjs/http-express';

const [Roles, getRoles] = createRouteValueMetadataUtils<Request, string[]>('ROLES');
// getRoles(req) reads from req[routeValueMetadataSymbol]
```

```ts
// Hono — custom implementation
import { createRouteValueMetadataUtils } from '@inversifyjs/http-hono';

const [Roles, getRoles] = createRouteValueMetadataUtils<string[]>('ROLES');
// getRoles(context) reads from context.get(routeValueMetadataSymbol)
```

The decorator returned by all variants is identical and framework-agnostic (it only sets reflect-metadata).

**Rationale:** Most adapters store metadata on the request object via the same well-known symbol, so a shared getter in core works for them. However, Hono stores metadata on its `Context` object using `c.set()` / `c.get()`, making a request-based getter incompatible. Per-adapter exports give each adapter control over its getter while keeping the decorator uniform.

**Alternatives considered:**
- Single core factory for all adapters: discarded because Hono's context-based storage is incompatible with a request-based getter. Forcing Hono to also set the symbol on the request object would be a workaround rather than a proper design.

### 6. Hono adapter uses context variables exclusively

**Decision:** Hono's request object (`HonoRequest`) is a thin wrapper that doesn't support arbitrary properties as cleanly. The Hono adapter's `_getRouteValueMetadataHandler` middleware uses Hono's built-in `c.set(key, value)` API to store the metadata map in the Hono context. The Hono-specific `createRouteValueMetadataUtils` getter reads from the Hono context via `context.get(routeValueMetadataSymbol)`. The Hono adapter does **not** set the symbol on the request object.

**Rationale:** Hono's `Context` is the idiomatic way to pass per-request data. Since Hono has its own `createRouteValueMetadataUtils` with a context-aware getter, there is no need to bridge to the request-based approach.

## Risks / Trade-offs

- **[Symbol property on request objects]** → Some frameworks may seal/freeze request objects in future versions. Mitigation: the symbol approach is widely used in the Express/Fastify ecosystem and is unlikely to break. Hono avoids this entirely by using its native context API.

- **[Metadata only available after middleware injection]** → If a custom parameter decorator or native handler accesses the request before the route value metadata middleware runs, the metadata won't be available. Mitigation: the metadata middleware is prepended to the pre-handler list, so it runs before any user-defined middleware, guards, or the handler.

- **[Breaking type change on RouteParams]** → Adding a mandatory `routeValueMetadataMap` to `RouteParams` will break custom adapters that construct `RouteParams` manually. Mitigation: this is an internal interface, not part of the public API. Custom adapter authors must add the field (set to `undefined` if unsupported).
