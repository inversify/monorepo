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
The `InversifyHonoHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that stores the metadata map in the Hono context using Hono's `c.set()` API. The Hono adapter SHALL NOT set `request[routeValueMetadataSymbol]` on the request object.

#### Scenario: Middleware sets metadata on Hono context only
- **WHEN** a route has route value metadata and the Hono adapter processes a matching request
- **THEN** the Hono context SHALL contain the route's metadata map retrievable via `c.get()` before any user middleware executes

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

### Requirement: Express adapter exports createRouteValueMetadataUtils
The `@inversifyjs/http-express` package SHALL export a `createRouteValueMetadataUtils` function that is a re-export of the core `createRouteValueMetadataUtils` from `@inversifyjs/http-core`.

#### Scenario: Express factory is the core factory
- **WHEN** `createRouteValueMetadataUtils` is imported from `@inversifyjs/http-express`
- **THEN** it SHALL be the same function as the one exported by `@inversifyjs/http-core`

### Requirement: Express v4 adapter exports createRouteValueMetadataUtils
The `@inversifyjs/http-express-v4` package SHALL export a `createRouteValueMetadataUtils` function that is a re-export of the core `createRouteValueMetadataUtils` from `@inversifyjs/http-core`.

#### Scenario: Express v4 factory is the core factory
- **WHEN** `createRouteValueMetadataUtils` is imported from `@inversifyjs/http-express-v4`
- **THEN** it SHALL be the same function as the one exported by `@inversifyjs/http-core`

### Requirement: Fastify adapter exports createRouteValueMetadataUtils
The `@inversifyjs/http-fastify` package SHALL export a `createRouteValueMetadataUtils` function that is a re-export of the core `createRouteValueMetadataUtils` from `@inversifyjs/http-core`.

#### Scenario: Fastify factory is the core factory
- **WHEN** `createRouteValueMetadataUtils` is imported from `@inversifyjs/http-fastify`
- **THEN** it SHALL be the same function as the one exported by `@inversifyjs/http-core`

### Requirement: Hono adapter exports createRouteValueMetadataUtils with context-based getter
The `@inversifyjs/http-hono` package SHALL export a `createRouteValueMetadataUtils<T>(key: string | symbol)` function that returns a `[decorator, getter]` tuple. The decorator SHALL be the same framework-agnostic decorator as the core implementation. The getter SHALL accept a Hono `Context` object and retrieve the metadata value by calling `context.get(routeValueMetadataSymbol)` and reading the key from the returned map.

#### Scenario: Hono factory returns context-based getter
- **WHEN** `createRouteValueMetadataUtils<string[]>('ROLES')` is called using the Hono export
- **THEN** the getter SHALL accept a Hono `Context` and return the metadata value stored via `c.set()` by the adapter middleware

#### Scenario: Hono getter returns undefined when no metadata is present
- **WHEN** a Hono `Context` does not have the metadata key set
- **THEN** calling the getter SHALL return `undefined`

### Requirement: uWebSockets adapter exports createRouteValueMetadataUtils
The `@inversifyjs/http-uwebsockets` package SHALL export a `createRouteValueMetadataUtils` function that is a re-export of the core `createRouteValueMetadataUtils` from `@inversifyjs/http-core`.

#### Scenario: uWebSockets factory is the core factory
- **WHEN** `createRouteValueMetadataUtils` is imported from `@inversifyjs/http-uwebsockets`
- **THEN** it SHALL be the same function as the one exported by `@inversifyjs/http-core`
