## 1. Core metadata infrastructure (`@inversifyjs/http-core`)

- [ ] 1.1 Add `routeValueMetadataReflectKey` to `packages/framework/http/libraries/core/src/reflectMetadata/data/`
- [ ] 1.2 Create the route value metadata decorator function that stores metadata on the controller constructor using `updateOwnReflectMetadata` with the structure `Map<string | symbol, Map<string | symbol, unknown>>`
- [ ] 1.3 Add unit tests for the route value metadata decorator (single decorator, multiple decorators on same method, decorators on different methods)
- [ ] 1.4 Create `routeValueMetadataSymbol` symbol and export it from `@inversifyjs/http-core`

## 2. Router explorer integration (`@inversifyjs/http-core`)

- [ ] 2.1 Add optional `routeValueMetadataMap?: Map<string | symbol, unknown>` field to `RouterExplorerControllerMethodMetadata` (optional at this stage to avoid breaking existing code)
- [ ] 2.2 Create a getter function (e.g., `getControllerMethodRouteValueMetadata`) to extract route value metadata for a specific method from the controller constructor
- [ ] 2.3 Update `buildRouterExplorerControllerMethodMetadata` to call the getter and populate the new field
- [ ] 2.4 Add unit tests for route value metadata extraction in the router explorer (with metadata, without metadata)

## 3. RouteParams and base adapter (`@inversifyjs/http-core`)

- [ ] 3.1 Add optional `routeValueMetadataMap?: Map<string | symbol, unknown>` field to `RouteParams` interface (optional at this stage to avoid breaking existing code)
- [ ] 3.2 Populate `routeValueMetadataMap` in the base adapter's route params building logic (where `RouteParams` objects are constructed from `RouterExplorerControllerMethodMetadata`)
- [ ] 3.3 Add the protected `_getRouteValueMetadataHandler` method to `InversifyHttpAdapter` with a default `undefined` return
- [ ] 3.4 Update the base adapter to call `_getRouteValueMetadataHandler` when `routeValueMetadataMap` is non-empty and prepend the returned middleware to the pre-handler list
- [ ] 3.5 Add unit tests for the base adapter route value metadata handler integration (middleware prepend, skip on empty map)
- [ ] 3.6 Export new public types and symbols from `@inversifyjs/http-core` index

## 4. Express adapter (`@inversifyjs/http-express`)

- [ ] 4.1 Override `_getRouteValueMetadataHandler` in `InversifyExpressHttpAdapter` to return a middleware that sets `req[routeValueMetadataSymbol]` to the metadata map
- [ ] 4.2 Create `createExpressRouteValueMetadataUtils<T>(key: string | symbol)` factory function returning `[decorator, getter]` tuple
- [ ] 4.3 Add unit tests for the Express route value metadata handler middleware
- [ ] 4.4 Add unit tests for `createExpressRouteValueMetadataUtils` (decorator sets metadata, getter retrieves value, getter returns undefined for missing metadata)
- [ ] 4.5 Export `createExpressRouteValueMetadataUtils` from the Express package index

## 5. Express v4 adapter (`@inversifyjs/http-express-v4`)

- [ ] 5.1 Override `_getRouteValueMetadataHandler` in `InversifyExpressHttpAdapter` (v4) to return a middleware that sets `req[routeValueMetadataSymbol]`
- [ ] 5.2 Create `createExpressV4RouteValueMetadataUtils<T>(key: string | symbol)` factory function
- [ ] 5.3 Add unit tests for the Express v4 route value metadata handler and factory
- [ ] 5.4 Export `createExpressV4RouteValueMetadataUtils` from the Express v4 package index

## 6. Fastify adapter (`@inversifyjs/http-fastify`)

- [ ] 6.1 Override `_getRouteValueMetadataHandler` in `InversifyFastifyHttpAdapter` to return a middleware that sets `request[routeValueMetadataSymbol]`
- [ ] 6.2 Create `createFastifyRouteValueMetadataUtils<T>(key: string | symbol)` factory function
- [ ] 6.3 Add unit tests for the Fastify route value metadata handler and factory
- [ ] 6.4 Export `createFastifyRouteValueMetadataUtils` from the Fastify package index

## 7. Hono adapter (`@inversifyjs/http-hono`)

- [ ] 7.1 Override `_getRouteValueMetadataHandler` in `InversifyHonoHttpAdapter` to return a middleware that stores metadata in the Hono context via `c.set()`
- [ ] 7.2 Create `createHonoRouteValueMetadataUtils<T>(key: string | symbol)` factory function (getter reads from Hono `Context` via `c.get()`)
- [ ] 7.3 Add unit tests for the Hono route value metadata handler and factory
- [ ] 7.4 Export `createHonoRouteValueMetadataUtils` from the Hono package index

## 8. uWebSockets adapter (`@inversifyjs/http-uwebsockets`)

- [ ] 8.1 Override `_getRouteValueMetadataHandler` in `InversifyUwebsocketsHttpAdapter` to return a middleware that sets `req[routeValueMetadataSymbol]` to the metadata map
- [ ] 8.2 Create `createUwebsocketsRouteValueMetadataUtils<T>(key: string | symbol)` factory function returning `[decorator, getter]` tuple
- [ ] 8.3 Add unit tests for the uWebSockets route value metadata handler middleware
- [ ] 8.4 Add unit tests for `createUwebsocketsRouteValueMetadataUtils`
- [ ] 8.5 Export `createUwebsocketsRouteValueMetadataUtils` from the uWebSockets package index

## 9. E2E tests (`@inversifyjs/http-e2e-tests`)

- [ ] 9.1 Create a `routeValueMetadata.feature` Gherkin feature file with a scenario outline testing that middleware can read route value metadata, parameterized by adapter (express, express4, fastify, hono, uwebsockets)
- [ ] 9.2 Create per-adapter middleware classes that read route value metadata via the getter and set a response header with the retrieved value (e.g., `x-route-roles`)
- [ ] 9.3 Create per-adapter controller classes that apply the route value metadata decorator and the middleware from 9.2
- [ ] 9.4 Add step definitions wiring controllers and middleware into the container and asserting the response header contains the expected metadata value
- [ ] 9.5 Run the e2e test suite to verify all five adapters pass

## 10. Make route value metadata fields mandatory

- [ ] 10.1 Change `routeValueMetadataMap` from optional to mandatory in `RouterExplorerControllerMethodMetadata` (type: `Map<string | symbol, unknown>`)
- [ ] 10.2 Change `routeValueMetadataMap` from optional to mandatory in `RouteParams` (type: `Map<string | symbol, unknown> | undefined`)
- [ ] 10.3 Fix all resulting compilation errors across http-core, adapters, and their tests

## 11. Verification

- [ ] 11.1 Run full test suite across all modified packages (`pnpm run --filter "@inversifyjs/http-core" test && pnpm run --filter "@inversifyjs/http-express" test && pnpm run --filter "@inversifyjs/http-express-v4" test && pnpm run --filter "@inversifyjs/http-fastify" test && pnpm run --filter "@inversifyjs/http-hono" test && pnpm run --filter "@inversifyjs/http-uwebsockets" test`)
- [ ] 11.2 Run linter and formatter on modified packages
- [ ] 11.3 Run e2e tests (`pnpm run --filter "@inversifyjs/http-e2e-tests" test`)
- [ ] 11.4 Verify build succeeds for all modified packages

