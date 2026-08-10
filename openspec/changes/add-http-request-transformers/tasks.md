## 1. Minimal core plumbing (`@inversifyjs/http-core`)

- [ ] 1.1 Add a protected `_resolveRequestTransformers(controllerMetadata, methodMetadata)` (final name TBD) on `InversifyHttpAdapter` that defaults to `undefined`
- [ ] 1.2 Add a mandatory transformers field on `RouteParams` typed to allow `undefined`, and populate it from the protected hook when building route params
- [ ] 1.3 Ensure other adapters compile and behave unchanged with `undefined` transformers
- [ ] 1.4 Add unit tests for the default `undefined` resolution path

## 2. Request transformers API (`@inversifyjs/http-uwebsockets`)

- [ ] 2.1 Define and export `RequestTransformer` type (request, response, options → request | Promise<request>)
- [ ] 2.2 Add reflect-metadata storage + `@UseRequestTransformers(...)` method decorator (functions, declaration order)
- [ ] 2.3 Override `_resolveRequestTransformers` to read uWebSockets transformer metadata for the method (including transformers registered by `@CaptureRequestValues`)
- [ ] 2.4 Add unit tests for decorator registration (single, multiple, absent)

## 3. Build-time fork in `_buildRouter` (`@inversifyjs/http-uwebsockets`)

- [ ] 3.1 When transformers are `undefined`, register the route callback exactly as today (`onAborted` + `handleMiddlewareList` with native req)
- [ ] 3.2 When transformers are present, register a callback that registers `onAborted`, runs transformers sequentially (await + swap) inside the same error-filter path used for middleware failures, then calls `handleMiddlewareList` with the transformed request
- [ ] 3.3 Do not modify `handleMiddlewareList` for transform/swap support
- [ ] 3.4 Pass adapter options into transformers (body/headers/method/url/query/params accessors as needed)
- [ ] 3.5 Add unit/integration tests for sync swap, async swap, multi-transformer composition, absent transformers build-time omission, transformers before chained global pre-handlers, transformer throw/rejection handled by error filters, and `onAborted` on both forks

## 4. Capture decorator (`@inversifyjs/http-uwebsockets`)

- [ ] 4.1 Define public capture value kinds (method, url, headers, query, params, body)
- [ ] 4.2 Implement `@CaptureRequestValues(...)` method decorator that closes over `target` / `methodKey` / kinds and registers a capture `RequestTransformer`
- [ ] 4.3 On first invocation needing params, resolve controller + method path metadata via closed-over identity, extract param names, and cache them; fail fast if path metadata is missing
- [ ] 4.4 Implement sync full snapshots: headers map, query map, method, url-with-query, named params via cached names
- [ ] 4.5 Implement request Proxy serving snapshots; unselected kinds fail clearly without native fallback; forward own/symbol property get/set
- [ ] 4.6 Implement body capture storage + `_getBody` reuse via a well-known association on the transformed request
- [ ] 4.7 Enable full named params access (`getParams()`-style) on captured requests
- [ ] 4.8 Export transformer API and `@CaptureRequestValues` from the package index

## 5. Docs and verification

- [ ] 5.1 Document `@UseRequestTransformers`, `@CaptureRequestValues`, and lazy-cached param-name resolution under the uWebSockets adapter
- [ ] 5.2 Unit tests: Proxy after simulated await; unselected kind error; symbol pass-through; body reuse / omit body; first-use param name cache; missing-path error; controller-path params (e.g. `@Controller('/:tenantId')`)
- [ ] 5.3 Integration test: custom parameter decorator awaits then `options.getMethod(request)` succeeds when method was captured
- [ ] 5.4 Run `pnpm run --filter "@inversifyjs/http-core" test` and `pnpm run --filter "@inversifyjs/http-uwebsockets" test`
- [ ] 5.5 Lint/format and build modified packages
