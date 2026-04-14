## 0. Prerequisite: Fix `ALL_JSON_SCHEMA_TYPES` and number/integer subtype handling

- [x] 0.1 Add `'integer'` to the `ALL_JSON_SCHEMA_TYPES` constant in `src/validation/calculations/inferOpenApiSchemaTypes.ts` so the universal set includes all seven `JsonSchemaType` values
- [x] 0.2 Handle the number/integer subtype relationship in `intersectSets` (`number ∩ integer = integer`) and normalize union results (`number ∪ integer = number`)
- [x] 0.3 Add test cases to the existing `inferOpenApiSchemaTypes` spec covering: integer type, `allOf` with number and integer, `allOf` with integer and constraint-only schema, `anyOf` with number and integer, `type: ["number", "integer"]`

## 1. Shared models and types

- [x] 1.1 Add `validatedInputParamHeaderType` unique symbol to `src/validation/models/validatedInputParamTypes.ts`
- [x] 1.2 Create `HeaderValidationInputParam` interface at `src/validation/models/HeaderValidationInputParam.ts` with fields: `headers` (`Record<string, string | string[] | undefined>`), `method` (string), `path` (string), `type` (`typeof validatedInputParamHeaderType`)
- [x] 1.3 Update `ValidationInputParam` union in `src/validation/models/ValidatedDecoratorResult.ts` to include `HeaderValidationInputParam`
- [x] 1.4 Extend `ValidationCacheEntry` in `src/validation/models/v3Dot1/ValidationCacheEntry.ts` to add `headers: Map<string, ValidateFunction>` field
- [x] 1.5 Extend `ValidationCacheEntry` in `src/validation/models/v3Dot2/ValidationCacheEntry.ts` to add `headers: Map<string, ValidateFunction>` field
- [x] 1.6 Update `ValidationCache.getOrCreate` in `src/validation/services/v3Dot1/ValidationCache.ts` to initialize the `headers` map
- [x] 1.7 Update `ValidationCache.getOrCreate` in `src/validation/services/v3Dot2/ValidationCache.ts` to initialize the `headers` map

## 2. `@ValidatedHeaders()` custom parameter decorator

- [x] 2.1 Implement the `@ValidatedHeaders()` custom parameter decorator at `src/metadata/decorators/ValidatedHeaders.ts` that: calls `setValidateMetadata` to store the validation marker; uses `createCustomParameterDecorator` with a handler that extracts all headers (via `options.getHeaders(request)`), HTTP method, URL, and path; returns a `HeaderValidationInputParam`
- [x] 2.2 Add unit tests for `ValidatedHeaders`: verifies `setValidateMetadata` is called and `createCustomParameterDecorator` is called with the appropriate handler
- [x] 2.3 Export `ValidatedHeaders` from `src/index.ts`

## 3. Header coercion utility

- [x] 3.1 Implement `coerceHeaderValue` at `src/validation/calculations/coerceHeaderValue.ts` (shared, version-agnostic) that receives a raw header value (`string | string[] | undefined`) and a `Set<JsonSchemaType>` (already resolved by the caller via `inferOpenApiSchemaTypes`). For each type in the set, attempt coercion: `"integer"` → `Number()` + `Number.isInteger()`, `"number"` → `Number()` + `NaN` check, `"boolean"` → `"true"`/`"false"` mapping, `"string"` → pass-through, `"array"` → comma-split (or use `string[]` directly), `"null"` → empty string → `null`. Returns an array of `{ type, coercedValue }` candidates (only types where coercion succeeded), with the `"string"` candidate always first when present. Handles `string[]` adapter input (use first element for non-array types, use directly for array type).
- [x] 3.2 Add unit tests for `coerceHeaderValue` covering: single type coercions, multi-type sets (try all), string candidate ordered first, empty candidates when nothing coerces, `string[]` input, array comma-split

## 4. Header parameter resolution helpers (v3.1)

- [x] 4.1 Implement `getHeaderParameterObjects` at `src/validation/calculations/v3Dot1/getHeaderParameterObjects.ts` that: receives `openApiObject`, `openApiResolver`, `method`, and `path`; calls `getPathItemObject` and `getOperationObject`; collects operation-level and path-item-level parameters; resolves `$ref` references; filters for `in: 'header'`; merges with operation-level overriding path-item-level by name (case-insensitive); returns `Map<string, { parameter: OpenApi3Dot1ParameterObject, pointerPrefix: string }>` keyed by lowercase header name, where `pointerPrefix` is the JSON pointer path to the parameter in the spec
- [x] 4.2 Add unit tests for `getHeaderParameterObjects` covering: operation-only params, path-item-only params, merge with override, `$ref` resolution, empty parameters

## 5. Header validation handler (v3.1)

- [x] 5.1 Implement `handleHeaderValidation` at `src/validation/calculations/v3Dot1/handleHeaderValidation.ts` that: calls `getHeaderParameterObjects` (which internally resolves path-item and operation), checks required headers are present, for each header: calls `inferOpenApiSchemaTypes` to get possible types, calls `coerceHeaderValue` to get candidates, for array candidates coerces individual items via `inferOpenApiSchemaTypes` on the `items` schema and `coerceHeaderValue` per element, tries each candidate with AJV validation (caching via `ValidationCacheEntry.headers`), uses the first valid candidate; if no candidate passes throws `InversifyValidationError`; returns validated+coerced headers record
- [x] 5.2 Add unit tests for `handleHeaderValidation` covering: valid headers, missing required header, invalid schema violation, optional absent header, simple type coercion, multi-type schema coercion, `$ref` schema, `allOf`/`anyOf` schemas, case-insensitive matching, caching

## 6. Header parameter resolution helpers (v3.2)

- [x] 6.1 Implement `getHeaderParameterObjects` at `src/validation/calculations/v3Dot2/getHeaderParameterObjects.ts` (mirrors v3.1 with v3.2 types)
- [x] 6.2 Add unit tests for `getHeaderParameterObjects` (v3.2)

## 7. Header validation handler (v3.2)

- [x] 7.1 Implement `handleHeaderValidation` at `src/validation/calculations/v3Dot2/handleHeaderValidation.ts` (mirrors v3.1 with v3.2 types)
- [x] 7.2 Add unit tests for `handleHeaderValidation` (v3.2)

## 8. Extend OpenApiValidationPipe (v3.1 and v3.2)

- [x] 8.1 Add `[validatedInputParamHeaderType, handleHeaderValidation]` to the handler pairs in `src/validation/pipes/v3Dot1/OpenApiValidationPipe.ts`
- [x] 8.2 Add `[validatedInputParamHeaderType, handleHeaderValidation]` to the handler pairs in `src/validation/pipes/v3Dot2/OpenApiValidationPipe.ts`

## 9. Integration testing

- [x] 9.1 Write an integration test (v3.1) demonstrating end-to-end header validation: a controller with `@OasParameter({ in: 'header', ... })` + `@ValidatedHeaders()`, an OpenAPI spec populated by `SwaggerUiProvider`, and the `OpenApiValidationPipe` validating valid headers, missing required headers, invalid header values, and complex schema types
- [x] 9.2 Write an integration test (v3.2) mirroring the v3.1 test with v3.2 types and imports

## 10. Verification

- [ ] 10.1 Run the full test suite (`pnpm run --filter "@inversifyjs/open-api-validation" test`)
- [ ] 10.2 Run linter and formatter (`pnpm run --filter "@inversifyjs/open-api-validation" lint && pnpm run --filter "@inversifyjs/open-api-validation" format`)
- [ ] 10.3 Verify the full build succeeds (`pnpm run build`)
