## Why

HTTP middleware often needs access to custom metadata associated with a specific route (e.g., required roles, rate-limit tiers, feature flags). Currently, there is no built-in mechanism in the HTTP adapter layer to attach arbitrary metadata to a route via decorators and then retrieve it from within middleware at request time. Developers must resort to ad-hoc solutions that are fragile and adapter-specific.

## What Changes

- Add a `createRouteValueMetadataUtils` factory function in `@inversifyjs/http-core` that produces a pair: a method decorator to set route-level metadata on a controller method, and a getter function to retrieve it from the request object at runtime. The getter reads from a well-known symbol set by each adapter's middleware, so the same factory works across all adapters.
- Extend `RouterExplorerControllerMethodMetadata` with a route value metadata map so the metadata flows from decorators through the router explorer into `RouteParams`.
- Extend `RouteParams` with a mandatory route value metadata field (value may be `undefined` for adapters that do not support it).
- Each adapter overrides a new `_getRouteValueMetadataHandler` protected method to return a middleware that stores the route value metadata on the request object via the shared symbol, making it retrievable by the core getter at runtime.

## Capabilities

### New Capabilities
- `http-route-value-metadata-core`: Core metadata decorator factory (`createRouteValueMetadataUtils`), metadata storage model, getter function, and integration into the router explorer and `RouteParams` pipeline.
- `http-route-value-metadata-adapters`: Adapter-specific `_getRouteValueMetadataHandler` middleware implementations for Express, Express v4, Fastify, Hono, and uWebSockets that store the route value metadata on the request object via the shared symbol.

### Modified Capabilities

## Impact

- **Packages modified**: `@inversifyjs/http-core` (metadata model, router explorer, route params, base adapter), `@inversifyjs/http-express`, `@inversifyjs/http-express-v4`, `@inversifyjs/http-fastify`, `@inversifyjs/http-hono`, `@inversifyjs/http-uwebsockets`.
- **Public API additions**: `@inversifyjs/http-core` gains the `createRouteValueMetadataUtils` factory function and new types/interfaces for route value metadata.
- **No breaking changes**: All additions are opt-in; existing controllers and middleware continue to work unchanged.
