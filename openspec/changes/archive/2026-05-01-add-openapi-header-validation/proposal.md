## Why

The `@inversifyjs/open-api-validation` package currently validates only request bodies against OpenAPI schemas. Developers who use `@OasParameter({ in: 'header', ... })` decorators to document required or typed headers still need to write separate validation logic. Adding header validation reuses the same OpenAPI-as-single-source-of-truth approach established by body validation, eliminating duplicate definitions and ensuring documented headers are enforced at runtime.

## What Changes

- **Add a `@ValidatedHeaders()` custom parameter decorator** (version-agnostic, shared) that uses `createCustomParameterDecorator` to extract all headers from the request along with the HTTP method and URL path, packaging them into a `HeaderValidationInputParam` with a `validatedInputParamHeaderType` discriminator symbol.
- **Add `handleHeaderValidation` calculation modules** (v3.1 and v3.2) that resolve the OpenAPI operation's `parameters` array, filter for `in: 'header'` entries (merging path-item-level and operation-level parameters), resolve `$ref` references, and validate each header value against its declared schema using AJV JSON pointers — throwing `InversifyValidationError` on failure.
- **Add `getHeaderParameterObjects` helper** (v3.1 and v3.2) that collects all header parameters for an operation, handling both operation-level and path-item-level parameters (operation-level overrides path-item-level by name, per OpenAPI spec).
- **Extend `ValidationCacheEntry`** with a `headers` field to cache compiled AJV `ValidateFunction` instances per header name.
- **Extend the composite handler** in both `OpenApiValidationPipe` implementations to dispatch to `handleHeaderValidation` when the input's `type` discriminator is `validatedInputParamHeaderType`.
- **Extend `ValidationInputParam`** union type to include `HeaderValidationInputParam`.
- **Export `ValidatedHeaders`** from the package root barrel (`@inversifyjs/open-api-validation`).
- **Handle header type coercion**: HTTP headers are always strings, but OpenAPI schemas may declare `type: "integer"`, `type: "number"`, or `type: "boolean"`, and may use complex type declarations (`allOf`, `anyOf`, `$ref`, union types). The handler uses `inferOpenApiSchemaTypes` to resolve the set of possible types from the schema, tries coercion for each type, and validates with AJV — using the first coerced value that passes validation.

## Capabilities

### New Capabilities
- `openapi-header-validation`: Provides `@ValidatedHeaders()` custom parameter decorator and extends the existing version-specific `OpenApiValidationPipe` (v3.1 and v3.2) to validate request headers against OpenAPI parameter schemas.

### Modified Capabilities
- `openapi-body-validation`: `ValidationCacheEntry` gains a `headers` field. `ValidationInputParam` union type is extended with `HeaderValidationInputParam`. The `OpenApiValidationPipe` handler array is extended with the header validation pair.

## Impact

- **Modified package**: `@inversifyjs/open-api-validation` — new `ValidatedHeaders` decorator export from root, new header validation handlers and helpers in both v3.1 and v3.2, extended `ValidationCacheEntry` and `ValidationInputParam` types, extended `OpenApiValidationPipe` handler registration.
- **No new packages or dependencies**: All changes are within the existing `@inversifyjs/open-api-validation` package using its current dependencies (`ajv`, `@inversifyjs/open-api-types`, etc.).
- **Non-breaking**: Existing `@ValidatedBody()` and `OpenApiValidationPipe` behavior is unchanged. The new `@ValidatedHeaders()` decorator is purely additive.
- **Adapter-agnostic**: Uses `options.getHeaders(request)` from `CustomParameterDecoratorHandlerOptions`, which all HTTP adapters already implement.
