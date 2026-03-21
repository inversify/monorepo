## ADDED Requirements

### Requirement: Route value metadata reflect key
The system SHALL define a unique reflect metadata key (`routeValueMetadataReflectKey`) in `@inversifyjs/http-core` for storing route value metadata on controller constructors.

#### Scenario: Metadata key is unique
- **WHEN** the `routeValueMetadataReflectKey` is compared against all other reflect metadata keys in the framework
- **THEN** it SHALL be a distinct value that does not collide with any existing metadata key

### Requirement: Route value metadata decorator sets metadata on controller
The decorator produced by the factory function SHALL store the provided value on the controller constructor using `reflect-metadata`. The metadata structure SHALL be a `Map<string | symbol, Map<string | symbol, unknown>>` where the outer key is the controller method key and the inner key is the user-provided metadata identifier.

#### Scenario: Single metadata decorator on a method
- **WHEN** a decorator created with key `'ROLES'` and value `['admin']` is applied to a controller method `getDashboard`
- **THEN** the controller constructor's reflect metadata at `routeValueMetadataReflectKey` SHALL contain an entry where key `getDashboard` maps to a `Map` containing `{ 'ROLES' => ['admin'] }`

#### Scenario: Multiple metadata decorators on the same method
- **WHEN** a decorator with key `'ROLES'` and value `['admin']` and another decorator with key `'RATE_LIMIT'` and value `100` are both applied to the same controller method
- **THEN** the metadata map for that method SHALL contain both entries: `{ 'ROLES' => ['admin'], 'RATE_LIMIT' => 100 }`

#### Scenario: Metadata decorators on different methods of the same controller
- **WHEN** decorator with key `'ROLES'` and value `['admin']` is applied to method `getDashboard` and decorator with key `'ROLES'` and value `['user']` is applied to method `getProfile`
- **THEN** the metadata map SHALL have separate entries for each method key with their respective values

### Requirement: Route value metadata extraction in router explorer
The function `buildRouterExplorerControllerMethodMetadata` SHALL extract route value metadata from the controller constructor and include it in the returned `RouterExplorerControllerMethodMetadata`.

#### Scenario: Controller method has route value metadata
- **WHEN** a controller method has route value metadata set via decorators
- **THEN** the `RouterExplorerControllerMethodMetadata` SHALL include a `routeValueMetadataMap` field containing the metadata map for that method

#### Scenario: Controller method has no route value metadata
- **WHEN** a controller method has no route value metadata decorators
- **THEN** the `routeValueMetadataMap` field SHALL be an empty `Map`

### Requirement: Route value metadata in RouteParams
The `RouteParams` interface SHALL include a mandatory `routeValueMetadataMap` field of type `Map<string | symbol, unknown> | undefined`. The property SHALL NOT be optional — it MUST always be present on every `RouteParams` object.

#### Scenario: RouteParams built from method with metadata
- **WHEN** a `RouteParams` object is built from a controller method that has route value metadata
- **THEN** the `routeValueMetadataMap` field SHALL contain the metadata map for that method

#### Scenario: RouteParams built from method without metadata
- **WHEN** a `RouteParams` object is built from a controller method that has no route value metadata
- **THEN** the `routeValueMetadataMap` field SHALL be `undefined`

### Requirement: Route value metadata symbol for request storage
The system SHALL export a `routeValueMetadataSymbol` from `@inversifyjs/http-core` that adapters use to store route value metadata on request objects.

#### Scenario: Symbol is exported
- **WHEN** a consumer imports `routeValueMetadataSymbol` from `@inversifyjs/http-core`
- **THEN** it SHALL be a `Symbol` value usable as a property key on request objects

### Requirement: Base adapter route value metadata handler method
The `InversifyHttpAdapter` base class SHALL provide a protected method `_getRouteValueMetadataHandler` that receives a route value metadata map and returns an optional middleware handler. The default implementation SHALL return `undefined`.

#### Scenario: Default implementation returns undefined
- **WHEN** `_getRouteValueMetadataHandler` is called on the base adapter without being overridden
- **THEN** it SHALL return `undefined`

#### Scenario: Non-empty metadata map triggers middleware prepend
- **WHEN** a route has a non-empty `routeValueMetadataMap` and the adapter overrides `_getRouteValueMetadataHandler` returning a middleware handler
- **THEN** the base adapter SHALL prepend the returned middleware handler to the route's pre-handler middleware list

#### Scenario: Undefined metadata map skips middleware
- **WHEN** a route has an `undefined` `routeValueMetadataMap`
- **THEN** the base adapter SHALL NOT call `_getRouteValueMetadataHandler` or prepend any middleware

### Requirement: Route value metadata utils factory
The `@inversifyjs/http-core` package SHALL export a `createRouteValueMetadataUtils<T>(key: string | symbol)` function that returns a tuple `[decorator, getter]`. The decorator sets metadata on the controller method. The getter retrieves the metadata value from a request object by reading from `routeValueMetadataSymbol`.

#### Scenario: Factory returns decorator and getter
- **WHEN** `createRouteValueMetadataUtils<string[]>('ROLES')` is called
- **THEN** it SHALL return a tuple where the first element is a method decorator and the second element is a function that accepts a request-like object and returns `T | undefined`

#### Scenario: Getter retrieves metadata set by adapter middleware
- **WHEN** a controller method is decorated with the decorator passing value `['admin']`, and an adapter's `_getRouteValueMetadataHandler` middleware has set `request[routeValueMetadataSymbol]` to the route's metadata map
- **THEN** calling the getter with that request SHALL return `['admin']`

#### Scenario: Getter returns undefined when no metadata is present
- **WHEN** a request does not have `routeValueMetadataSymbol` set, or the metadata map does not contain the requested key
- **THEN** calling the getter SHALL return `undefined`
