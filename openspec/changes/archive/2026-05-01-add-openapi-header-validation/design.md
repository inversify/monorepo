## Context

The `@inversifyjs/open-api-validation` package already provides body validation via `@ValidatedBody()` and `OpenApiValidationPipe` (v3.1 and v3.2). The architecture uses:

- **Custom parameter decorators** (via `createCustomParameterDecorator`) that extract request context and return a discriminated input param object.
- **`buildCompositeValidationHandler`** that dispatches to the correct validation handler based on the input's `type` symbol.
- **Version-specific handlers** (`handleBodyValidation`) that resolve the OpenAPI operation, construct AJV JSON pointers, and validate.
- **`ValidationCacheEntry`** for caching compiled `ValidateFunction` instances.
- **Lazy AJV initialization** with the full OpenAPI spec loaded via `ajv.addSchema()`.

Header parameters in OpenAPI are defined as entries in `operationObject.parameters` (or `pathItemObject.parameters`) with `in: 'header'`. Each parameter has a `name`, optional `required` flag, and a `schema` (or `content`) that defines its type and constraints. Parameters can be `$ref` references. Operation-level parameters override path-item-level parameters with the same `name` and `in` value.

A key challenge is that HTTP headers are always strings, while OpenAPI schemas may declare `type: "integer"`, `type: "number"`, or `type: "boolean"`. Header values must be coerced before validation. Furthermore, JSON Schema allows complex type declarations through `allOf`, `anyOf`, union types (e.g., `type: ["string", "integer"]`), and `$ref` chains — so the schema type cannot always be read from a simple `type` field. The existing `inferOpenApiSchemaTypes` utility (version-agnostic, at `src/validation/calculations/inferOpenApiSchemaTypes.ts`) handles these cases by recursively resolving schemas to a set of possible `JsonSchemaType` values.

## Goals / Non-Goals

**Goals:**
- Validate request headers against OpenAPI parameter schemas declared with `in: 'header'`.
- Follow the established decorator + composite handler pattern exactly.
- Handle header type coercion (string → number, boolean) for non-string schemas.
- Handle `$ref` parameter references via the existing `OpenApiResolver`.
- Merge path-item-level and operation-level header parameters correctly (operation overrides).
- Cache compiled AJV validators per header name for performance.
- Enforce `required` header parameters (throw if absent).

**Non-Goals:**
- Query, path, or cookie parameter validation (future iterations).
- Response header validation.
- Header serialization styles (`style`, `explode`) — validate the raw header value against the schema only.
- Parameters defined with `content` instead of `schema` (edge case deferred).

## Decisions

### 1. `@ValidatedHeaders()` as a custom parameter decorator returning all headers

**Decision**: Create `@ValidatedHeaders()` following the same pattern as `@ValidatedBody()`. The handler extracts ALL headers (via `options.getHeaders(request)`) along with the HTTP method and URL path, and returns a `HeaderValidationInputParam`.

**Rationale**: The pipe needs all headers to validate required/optional headers collectively. Extracting individual headers would require multiple decorated parameters per method, which is awkward and doesn't allow validating that required headers are present.

**Return type**:
```typescript
interface HeaderValidationInputParam {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  path: string;
  type: typeof validatedInputParamHeaderType;
}
```

**Alternatives considered**:
- `@ValidatedHeader('name')` for individual headers: rejected because it can't enforce required headers that aren't bound to a parameter, and requires one decorator per header.

### 2. Schema-type-aware coercion with `inferOpenApiSchemaTypes` and try-each-coercion validation

**Decision**: Instead of naively reading `schema.type`, use `inferOpenApiSchemaTypes(openApiResolver, schemaPointer)` to resolve the set of possible `JsonSchemaType` values from the parameter's schema — handling `allOf`, `anyOf`, `$ref`, union types (`type: ["string", "integer"]`), and boolean schemas.

The coercion+validation flow for each header is:

1. Resolve the schema pointer and call `inferOpenApiSchemaTypes` → `Set<JsonSchemaType>`.
2. Call `coerceHeaderValue(rawValue, types)` which returns an array of `{ type, coercedValue }` candidates — one per type that coercion succeeded for (silently skipping types where coercion fails). The `"string"` candidate is always placed first in the array when present, since HTTP headers are natively strings and the raw value is the most faithful representation.
3. For each candidate (string first), run AJV validation on the coerced value.
4. The first candidate that passes AJV validation is the result (used as the returned header value).
5. If no candidate passes, throw `InversifyValidationError`.

Coercion rules per type:
- `"integer"` → `Number(value)`, fail if `NaN` or not `Number.isInteger()`
- `"number"` → `Number(value)`, fail if `NaN`
- `"boolean"` → `"true"` → `true`, `"false"` → `false`, anything else fails
- `"string"` → no coercion (pass through)
- `"array"` → comma-split the string value to produce `string[]` (default simple serialization style), or use `string[]` directly if the adapter provides it. Returns the split array as the coerced value. Item-level coercion (e.g., coercing each element from string to integer) is the handler's responsibility — it calls `inferOpenApiSchemaTypes` on the `items` schema and applies `coerceHeaderValue` to each element.
- `"null"` → only if value is empty string, coerce to `null`
- `"object"` → no coercion (not applicable for headers in practice)

`coerceHeaderValue` is version-agnostic (shared). It receives a `Set<JsonSchemaType>` (already resolved by the version-specific handler). Also handles `string[]` adapter input: use first element for non-array schemas, use directly for array schemas.

**Rationale**: JSON Schema allows complex type declarations. A naive `schema.type` check fails for schemas like `{ allOf: [{ type: "string" }, { anyOf: [{ type: "string" }, { type: "number" }] }] }` or `{ $ref: "#/components/schemas/PageSize" }`. `inferOpenApiSchemaTypes` already exists in v3.1 and correctly resolves these. Trying each candidate with AJV ensures that even when multiple types are possible, the strictest valid coercion is selected.

The `"string"` candidate is tried first because HTTP headers are natively strings: with a permissive schema (e.g., boolean `true` which resolves to all types), coercing `"hello"` to `Number` produces `NaN` — an unclean candidate that should never win when the raw string passes validation.

`Number()` is used instead of `parseInt()`/`parseFloat()` because `parseInt("42abc", 10)` silently returns `42`, while `Number("42abc")` correctly returns `NaN`.

**Alternatives considered**:
- AJV `coerceTypes: true`: rejected because it mutates inputs in-place and would apply to body validation too (the AJV instance is shared).
- Naive `schema.type` check: rejected because it breaks on complex schemas (`allOf`, `anyOf`, `$ref`, union types).
- Trying to determine a single "best" type from the set: rejected because schema constraints (e.g., `minimum`, `enum`) can make a type valid or invalid — only AJV knows.

### 3. Merging path-item and operation-level parameters

**Decision**: Implement `getHeaderParameterObjects` that receives the `openApiObject`, `openApiResolver`, `method`, and `path`, and:
1. Calls `getPathItemObject(openApiObject, path)` to get the path item object.
2. Calls `getOperationObject(openApiObject, method, path)` to get the operation object.
3. Collects operation-level parameters from `operationObject.parameters`.
4. Collects path-item-level parameters from `pathItemObject.parameters`.
5. Resolves `$ref` references via `OpenApiResolver`.
6. Filters for `in: 'header'`.
7. Merges: operation-level parameters take precedence over path-item-level parameters with the same `name` (per OpenAPI spec).
8. Returns a `Map<string, { parameter: ParameterObject, pointerPrefix: string }>` keyed by lowercase header name, where `pointerPrefix` is the JSON pointer path to the parameter in the spec.

**Rationale**: The OpenAPI specification (§4.8.10) states that path-level parameters can be overridden at the operation level. Using a Map keyed by name ensures correct override semantics.

### 4. AJV schema resolution via JSON pointers

**Decision**: Reuse the same pattern as body validation. For each header parameter, construct a JSON pointer to its schema. Because parameters can live at operation level or path-item level, `getHeaderParameterObjects` returns a map where each entry includes the resolved parameter object AND the JSON pointer prefix to that parameter's location in the spec tree.

For operation-level parameters:
```
schemaId#/paths/{path}/{method}/parameters/{index}/schema
```
For path-item-level parameters (inherited):
```
schemaId#/paths/{path}/parameters/{index}/schema
```

Where `{index}` is the parameter's position in the parameters array. `getHeaderParameterObjects` computes the pointer prefix for each parameter as it resolves them, returning `Map<string, { parameter: ParameterObject, pointerPrefix: string }>` keyed by lowercase header name. This allows `handleHeaderValidation` to construct the full schema pointer without re-scanning the arrays.

**Rationale**: Consistent with body validation's JSON pointer approach. AJV's `getSchema()` resolves `$ref` references automatically through JSON pointers. Bundling the pointer prefix with the parameter avoids redundant index lookups in the handler.

### 5. Caching strategy

**Decision**: Extend `ValidationCacheEntry` with a `headers` field:
```typescript
interface ValidationCacheEntry {
  body: Map<string | undefined, ValidateFunction>;
  headers: Map<string, ValidateFunction>;  // key: lowercase header name
}
```

**Rationale**: Like body validators, header validators are deterministic per path + method + header name. Caching avoids repeated `ajv.getSchema()` lookups.

### 6. Extending the composite handler

**Decision**: Add `[validatedInputParamHeaderType, handleHeaderValidation]` to the discriminator handler pairs in both v3.1 and v3.2 `OpenApiValidationPipe` implementations.

**Rationale**: The composite handler pattern was designed to be extensible. Adding a new pair requires no changes to `buildCompositeValidationHandler` itself.

### 7. After validation, return the headers record (with coerced values)

**Decision**: `handleHeaderValidation` returns the coerced headers object (`Record<string, unknown>`) containing only the validated header values (those declared in the OpenAPI spec). This is what the controller method parameter receives.

**Rationale**: Consistent with body validation, which returns `inputParam.body` (the actual value, not the wrapper). The user's controller parameter receives the useful coerced data.

**Alternatives considered**:
- Return all headers (including undeclared ones): rejected because undeclared headers aren't validated and may confuse consumers expecting only declared headers.
- Return the raw `HeaderValidationInputParam`: rejected because the controller method shouldn't need to unwrap the internal structure.

### 8. File structure (new/modified files)

New files:
```
src/metadata/decorators/ValidatedHeaders.ts
src/validation/models/HeaderValidationInputParam.ts
src/validation/calculations/coerceHeaderValue.ts
src/validation/calculations/v3Dot1/handleHeaderValidation.ts
src/validation/calculations/v3Dot1/getHeaderParameterObjects.ts
src/validation/calculations/v3Dot2/handleHeaderValidation.ts
src/validation/calculations/v3Dot2/getHeaderParameterObjects.ts
```

Modified files:
```
src/index.ts                                                          # export ValidatedHeaders
src/validation/models/validatedInputParamTypes.ts                     # add validatedInputParamHeaderType
src/validation/models/ValidatedDecoratorResult.ts                     # extend union
src/validation/models/v3Dot1/ValidationCacheEntry.ts                  # add headers field
src/validation/models/v3Dot2/ValidationCacheEntry.ts                  # add headers field
src/validation/calculations/inferOpenApiSchemaTypes.ts                # add 'integer' to ALL_JSON_SCHEMA_TYPES, handle number/integer subtype
src/validation/pipes/v3Dot1/OpenApiValidationPipe.ts                  # add header handler pair
src/validation/pipes/v3Dot2/OpenApiValidationPipe.ts                  # add header handler pair
```

## Risks / Trade-offs

- **[Risk] `ALL_JSON_SCHEMA_TYPES` constant was missing `'integer'` and lacked number/integer subtype handling** → The existing `inferOpenApiSchemaTypes` defined `ALL_JSON_SCHEMA_TYPES` without `'integer'`, causing `allOf` intersections with integer schemas to produce empty sets. Additionally, `intersectSets` treated `number` and `integer` as disjoint types, so `allOf: [{ type: "number" }, { type: "integer" }]` returned an empty set instead of `Set(['integer'])`. A prerequisite task adds `'integer'` to the constant, handles `number ∩ integer = integer` in set intersection, and normalizes `number ∪ integer = number` in set union. Since `inferOpenApiSchemaTypes` is version-agnostic, the fix applies once.

- **[Risk] Header values with complex serialization styles (e.g., `style: "simple"`, `explode: true`)** → Deferred. Initial implementation validates the raw header value against the schema. Complex serialization is uncommon for headers.
- **[Risk] Parameters defined with `content` instead of `schema`** → Deferred. The `content` map approach for parameters is rare and complex. Initial implementation only supports `schema`.
- **[Trade-off] `@ValidatedHeaders()` returns only declared headers** → Users who need undeclared headers must also use `@Headers()` separately. This is intentional: the decorator's purpose is "validated headers from the spec," not "all headers."
- **[Trade-off] Manual coercion instead of AJV `coerceTypes`** → More code, but avoids side effects on body validation and gives full control over coercion behavior.
- **[Trade-off] Duplicate v3.1/v3.2 implementations** → Same trade-off as body validation. Type parameters differ, logic is identical. Consistent with established conventions.
