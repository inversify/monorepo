## ADDED Requirements

### Requirement: Express route value metadata utils factory
The `@inversifyjs/http-express` package SHALL export a `createExpressRouteValueMetadataUtils<T>(key: string | symbol)` function that returns a tuple `[decorator, getter]`.

#### Scenario: Factory returns decorator and getter
- **WHEN** `createExpressRouteValueMetadataUtils<string[]>('ROLES')` is called
- **THEN** it SHALL return a tuple where the first element is a method decorator and the second element is a function that accepts an Express `Request` and returns `T | undefined`

#### Scenario: Getter retrieves metadata set by decorator
- **WHEN** a controller method is decorated with the decorator passing value `['admin']`, and a request matches that route
- **THEN** calling the getter with that request SHALL return `['admin']`

#### Scenario: Getter returns undefined for routes without metadata
- **WHEN** a request matches a route that was not decorated with the metadata decorator
- **THEN** calling the getter with that request SHALL return `undefined`

### Requirement: Express adapter overrides route value metadata handler
The `InversifyExpressHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `req[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Express request
- **WHEN** a route has route value metadata and the Express adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Express v4 route value metadata utils factory
The `@inversifyjs/http-express-v4` package SHALL export a `createExpressV4RouteValueMetadataUtils<T>(key: string | symbol)` function with the same behavior as the Express factory.

#### Scenario: Factory returns decorator and getter
- **WHEN** `createExpressV4RouteValueMetadataUtils<string[]>('ROLES')` is called
- **THEN** it SHALL return a tuple where the first element is a method decorator and the second element is a function that accepts an Express v4 `Request` and returns `T | undefined`

#### Scenario: Getter retrieves metadata set by decorator
- **WHEN** a controller method is decorated with the decorator passing value `['admin']`, and a request matches that route
- **THEN** calling the getter with that request SHALL return `['admin']`

### Requirement: Express v4 adapter overrides route value metadata handler
The `InversifyExpressHttpAdapter` (v4) SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `req[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Express v4 request
- **WHEN** a route has route value metadata and the Express v4 adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Fastify route value metadata utils factory
The `@inversifyjs/http-fastify` package SHALL export a `createFastifyRouteValueMetadataUtils<T>(key: string | symbol)` function that returns a tuple `[decorator, getter]`.

#### Scenario: Factory returns decorator and getter
- **WHEN** `createFastifyRouteValueMetadataUtils<string[]>('ROLES')` is called
- **THEN** it SHALL return a tuple where the first element is a method decorator and the second element is a function that accepts an `InversifyFastifyRequest` and returns `T | undefined`

#### Scenario: Getter retrieves metadata set by decorator
- **WHEN** a controller method is decorated with the decorator passing value `['admin']`, and a request matches that route
- **THEN** calling the getter with that request SHALL return `['admin']`

### Requirement: Fastify adapter overrides route value metadata handler
The `InversifyFastifyHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that sets `request[routeValueMetadataSymbol]` to the provided metadata map.

#### Scenario: Middleware sets metadata on Fastify request
- **WHEN** a route has route value metadata and the Fastify adapter processes a matching request
- **THEN** the request object SHALL have a property at `routeValueMetadataSymbol` containing the route's metadata map before any user middleware executes

### Requirement: Hono route value metadata utils factory
The `@inversifyjs/http-hono` package SHALL export a `createHonoRouteValueMetadataUtils<T>(key: string | symbol)` function that returns a tuple `[decorator, getter]`.

#### Scenario: Factory returns decorator and getter
- **WHEN** `createHonoRouteValueMetadataUtils<string[]>('ROLES')` is called
- **THEN** it SHALL return a tuple where the first element is a method decorator and the second element is a function that accepts a Hono `Context` and returns `T | undefined`

#### Scenario: Getter retrieves metadata set by decorator
- **WHEN** a controller method is decorated with the decorator passing value `['admin']`, and a request matches that route
- **THEN** calling the getter with the Hono context SHALL return `['admin']`

### Requirement: Hono adapter overrides route value metadata handler
The `InversifyHonoHttpAdapter` SHALL override `_getRouteValueMetadataHandler` to return a middleware that stores the metadata map in the Hono context using Hono's `c.set()` API.

#### Scenario: Middleware sets metadata on Hono context
- **WHEN** a route has route value metadata and the Hono adapter processes a matching request
- **THEN** the Hono context SHALL contain the route's metadata map retrievable via `c.get()` before any user middleware executes

### Requirement: uWebSockets adapter does not support route value metadata
The `@inversifyjs/http-uwebsockets` package SHALL NOT export any route value metadata factory. The uWebSockets adapter SHALL NOT override `_getRouteValueMetadataHandler`.

#### Scenario: No factory exported from uWebSockets package
- **WHEN** a consumer checks the exports of `@inversifyjs/http-uwebsockets`
- **THEN** there SHALL be no `createUwebSocketsRouteValueMetadataUtils` function

### Requirement: Route value metadata middleware executes before user middleware
The middleware injected by the adapter for route value metadata SHALL execute before any user-defined pre-handler middleware, guards, or interceptors for that route.

#### Scenario: Metadata available in user middleware
- **WHEN** a route has both route value metadata and user-defined middleware (e.g., `@ApplyMiddleware(AuthMiddleware)`)
- **THEN** the route value metadata SHALL be readable from the request inside `AuthMiddleware.execute` via the getter function

#### Scenario: Metadata available in guards
- **WHEN** a route has both route value metadata and a guard applied
- **THEN** the route value metadata SHALL be readable from the request inside the guard's `canActivate` method
