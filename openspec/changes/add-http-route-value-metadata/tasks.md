## 1. Core metadata infrastructure (`@inversifyjs/http-core`)

- [x] 1.1 Add `routeValueMetadataReflectKey` to `packages/framework/http/libraries/core/src/reflectMetadata/data/`
- [x] 1.2 Create the route value metadata decorator function that stores metadata on the controller constructor using `updateOwnReflectMetadata` with the structure `Map<string | symbol, Map<string | symbol, unknown>>`
- [x] 1.3 Add unit tests for the route value metadata decorator (single decorator, multiple decorators on same method, decorators on different methods)
- [x] 1.4 Create `routeValueMetadataSymbol` symbol and export it from `@inversifyjs/http-core`

## 2. Router explorer integration (`@inversifyjs/http-core`)

- [x] 2.1 Add optional `routeValueMetadataMap?: Map<string | symbol, unknown>` field to `RouterExplorerControllerMethodMetadata` (optional at this stage to avoid breaking existing code)
- [x] 2.2 Create a getter function (e.g., `getControllerMethodRouteValueMetadata`) to extract route value metadata for a specific method from the controller constructor
- [x] 2.3 Update `buildRouterExplorerControllerMethodMetadata` to call the getter and populate the new field
- [x] 2.4 Add unit tests for route value metadata extraction in the router explorer (with metadata, without metadata)

## 3. RouteParams and base adapter (`@inversifyjs/http-core`)

- [x] 3.1 Add optional `routeValueMetadataMap?: Map<string | symbol, unknown>` field to `RouteParams` interface (optional at this stage to avoid breaking existing code)
- [x] 3.2 Populate `routeValueMetadataMap` in the base adapter's route params building logic (where `RouteParams` objects are constructed from `RouterExplorerControllerMethodMetadata`)
- [x] 3.3 Add the protected `_getRouteValueMetadataHandler` method to `InversifyHttpAdapter` with a default `undefined` return
- [x] 3.4 Update the base adapter to call `_getRouteValueMetadataHandler` when `routeValueMetadataMap` is non-empty and prepend the returned middleware to the pre-handler list
- [x] 3.5 Export new public types and symbols from `@inversifyjs/http-core` index
- [x] 3.6 Create `createRouteValueMetadataUtils<TRequest, T>(key: string | symbol)` factory function in `@inversifyjs/http-core` that returns a `[decorator, getter]` tuple (base implementation for request-based adapters)

## 4. Express adapter (`@inversifyjs/http-express`)

- [x] 4.1 Override `_getRouteValueMetadataHandler` in `InversifyExpressHttpAdapter` to return a middleware that sets `req[routeValueMetadataSymbol]` to the metadata map

## 5. Express v4 adapter (`@inversifyjs/http-express-v4`)

- [x] 5.1 Override `_getRouteValueMetadataHandler` in `InversifyExpressHttpAdapter` (v4) to return a middleware that sets `req[routeValueMetadataSymbol]`

## 6. Fastify adapter (`@inversifyjs/http-fastify`)

- [x] 6.1 Override `_getRouteValueMetadataHandler` in `InversifyFastifyHttpAdapter` to return a middleware that sets `request[routeValueMetadataSymbol]`

## 7. Hono adapter (`@inversifyjs/http-hono`)

- [x] 7.1 Override `_getRouteValueMetadataHandler` in `InversifyHonoHttpAdapter` to return a middleware that sets `request[routeValueMetadataSymbol]` to the metadata map on the `HonoRequest` object

## 8. uWebSockets adapter (`@inversifyjs/http-uwebsockets`)

- [x] 8.1 Override `_getRouteValueMetadataHandler` in `InversifyUwebsocketsHttpAdapter` to return a middleware that sets `req[routeValueMetadataSymbol]` to the metadata map

## 9. Per-adapter `createRouteValueMetadataUtils` exports

- [x] 9.1 Re-export `createRouteValueMetadataUtils` from `@inversifyjs/http-express` (alias of core)
- [x] 9.2 Re-export `createRouteValueMetadataUtils` from `@inversifyjs/http-express-v4` (alias of core)
- [x] 9.3 Re-export `createRouteValueMetadataUtils` from `@inversifyjs/http-fastify` (alias of core)
- [x] 9.4 Create `createRouteValueMetadataUtils<T>(key)` wrapper in `@inversifyjs/http-hono` that delegates to the core implementation with `HonoRequest` as the request type, typing the getter to accept `HonoRequest`
- [x] 9.5 Add unit tests for the Hono-specific `createRouteValueMetadataUtils` (getter reads from request, returns undefined when not set)
- [x] 9.6 Re-export `createRouteValueMetadataUtils` from `@inversifyjs/http-uwebsockets` (alias of core)
- [x] 9.7 Export `createRouteValueMetadataUtils` in each adapter's `index.ts` barrel file

## 10. E2E tests (`@inversifyjs/http-e2e-tests`)

- [x] 10.1 Create a `routeValueMetadata.feature` Gherkin feature file with a scenario outline testing that middleware can read route value metadata, parameterized by adapter (express, express4, fastify, hono, uwebsockets)
- [x] 10.2 Create per-adapter middleware classes that read route value metadata via the adapter-specific getter and set a response header with the retrieved value (e.g., `x-route-roles`)
- [x] 10.3 Create per-adapter controller classes that apply the route value metadata decorator and the middleware from 10.2
- [x] 10.4 Add step definitions wiring controllers and middleware into the container and asserting the response header contains the expected metadata value
- [x] 10.5 Run the e2e test suite to verify all five adapters pass

## 11. Make route value metadata fields mandatory

- [x] 11.1 Change `routeValueMetadataMap` from optional to mandatory in `RouterExplorerControllerMethodMetadata` (type: `Map<string | symbol, unknown>`)
- [x] 11.2 Change `routeValueMetadataMap` from optional to mandatory in `RouteParams` (type: `Map<string | symbol, unknown> | undefined`)
- [x] 11.3 Fix all resulting compilation errors across http-core, adapters, and their tests

## 12. Verification

- [x] 12.1 Run full test suite across all modified packages (`pnpm run --filter "@inversifyjs/http-core" test && pnpm run --filter "@inversifyjs/http-express" test && pnpm run --filter "@inversifyjs/http-express-v4" test && pnpm run --filter "@inversifyjs/http-fastify" test && pnpm run --filter "@inversifyjs/http-hono" test && pnpm run --filter "@inversifyjs/http-uwebsockets" test`)
- [x] 12.2 Run linter and formatter on modified packages
- [x] 12.3 Run e2e tests (`pnpm run --filter "@inversifyjs/http-e2e-tests" test`)
- [x] 12.4 Verify build succeeds for all modified packages

