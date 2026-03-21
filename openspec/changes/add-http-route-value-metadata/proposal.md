## Why

HTTP middleware often needs access to custom metadata associated with a specific route (e.g., required roles, rate-limit tiers, feature flags). Currently, there is no built-in mechanism in the HTTP adapter layer to attach arbitrary metadata to a route via decorators and then retrieve it from within middleware at request time. Developers must resort to ad-hoc solutions that are fragile and adapter-specific.

## What Changes

- Add a `createRouteValueMetadataUtils` factory function in `@inversifyjs/http-core` that produces a pair: a method decorator to set route-level metadata on a controller method, and a retrieval function scoped to a specific adapter.
- Each adapter-specific package (Express, Express v4, Fastify, Hono) will export its own `create<Framework>RouteValueMetadataUtils` that wraps the core factory and wires up the adapter-specific request-to-route resolution.
- Extend `RouterExplorerControllerMethodMetadata` with a route value metadata map so the metadata flows from decorators through the router explorer into `RouteParams`.
- Extend `RouteParams` with a mandatory route value metadata field (value may be `undefined` for adapters that do not support it).
- Each adapter's `_buildRouter` will call a new overridable method to store the route value metadata keyed by the resolved route path, making it retrievable from the request at runtime.
- uWebSockets adapter will **not** support this feature since it does not expose route information in the request object.

## Capabilities

### New Capabilities
- `http-route-value-metadata-core`: Core metadata decorator factory, metadata storage model, and integration into the router explorer and `RouteParams` pipeline.
- `http-route-value-metadata-adapters`: Adapter-specific implementations for Express, Express v4, Fastify, and Hono that resolve the route from a request and look up stored metadata. Includes the public `create<Framework>RouteValueMetadataUtils` factories.

### Modified Capabilities

## Impact

- **Packages modified**: `@inversifyjs/http-core` (metadata model, router explorer, route params, base adapter), `@inversifyjs/http-express`, `@inversifyjs/http-express-v4`, `@inversifyjs/http-fastify`, `@inversifyjs/http-hono`.
- **Public API additions**: Each adapter package gains a new exported factory function. `@inversifyjs/http-core` gains new types/interfaces for route value metadata.
- **No breaking changes**: All additions are opt-in; existing controllers and middleware continue to work unchanged.
- **uWebSockets**: Explicitly unsupported; no changes to `@inversifyjs/http-uwebsockets`.
