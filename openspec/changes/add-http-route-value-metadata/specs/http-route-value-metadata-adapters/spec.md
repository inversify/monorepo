## ADDED Requirements

### Requirement: Express adapter overrides route value metadata handler
The `InversifyExpressHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `req[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Express request
- **WHEN** a route has route value metadata and the Express adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Express v4 adapter overrides route value metadata handler
The `InversifyExpressHttpAdapter` (v4) SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `req[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Express v4 request
- **WHEN** a route has route value metadata and the Express v4 adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Fastify adapter overrides route value metadata handler
The `InversifyFastifyHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `request[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Fastify request
- **WHEN** a route has route value metadata and the Fastify adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Hono adapter overrides route value metadata handler
The `InversifyHonoHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that stores the metadata map in the Hono context using Hono's `c.set()` API and also sets `request[routeValueMetadataSymbol]` on the request object for compatibility with the core getter.

#### Scenario: Middleware sets metadata on Hono context and request
- **WHEN** a route has route value metadata and the Hono adapter processes a matching request
- **THEN** the Hono context SHALL contain the route's metadata map retrievable via `c.get()` and the request object SHALL have the metadata map at `routeValueMetadataSymbol`, before any user middleware executes

### Requirement: uWebSockets adapter overrides route value metadata handler
The `InversifyUwebsocketsHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `req[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on uWebSockets request
- **WHEN** a route has route value metadata and the uWebSockets adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Route value metadata middleware executes before user middleware
The middleware injected by the adapter for route value metadata SHALL execute before any user-defined pre-handler middleware, guards, or interceptors for that route.

#### Scenario: Metadata available in user middleware
- **WHEN** a route has both route value metadata and user-defined middleware (e.g., `@ApplyMiddleware(AuthMiddleware)`)
- **THEN** the route value metadata SHALL be readable from the request inside `AuthMiddleware.execute` via the getter function

#### Scenario: Metadata available in guards
- **WHEN** a route has both route value metadata and a guard applied
- **THEN** the route value metadata SHALL be readable from the request inside the guard's `canActivate` method
