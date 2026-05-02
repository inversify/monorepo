### Requirement: ValidatedHeaders custom parameter decorator extracts headers and request context
The `@ValidatedHeaders()` decorator SHALL be a custom parameter decorator (built with `createCustomParameterDecorator` from `@inversifyjs/http-core`) that:
1. Stores a validation marker in reflect metadata under the dedicated key (`openApiValidationMetadataReflectKey`) at the parameter's index.
2. Extracts from the request: all headers (via `options.getHeaders(request)`), HTTP method (via `options.getMethod`), and URL (via `options.getUrl`).
3. Returns a `HeaderValidationInputParam` object containing the headers record, method, URL path, and a `type` discriminator symbol (`validatedInputParamHeaderType`).

The decorator is version-agnostic and exported from the package's root (`@inversifyjs/open-api-validation`).

#### Scenario: ValidatedHeaders applied to a controller method parameter
- **WHEN** `@ValidatedHeaders()` is applied to a controller method parameter
- **THEN** the parameter's reflect metadata (under `openApiValidationMetadataReflectKey`) SHALL contain a `true` marker at the parameter index
- **AND** at runtime, the custom parameter handler SHALL extract all headers, method, and URL from the request and return a `HeaderValidationInputParam`

#### Scenario: Headers returned as record
- **WHEN** the request has headers `{ "x-api-key": "abc123", "content-type": "application/json" }`
- **THEN** the `HeaderValidationInputParam.headers` SHALL contain `{ "x-api-key": "abc123", "content-type": "application/json" }` (the full record from `getHeaders(request)`)

### Requirement: OpenApiValidationPipe validates headers against OpenAPI parameter schemas (version-specific)
The `OpenApiValidationPipe` (both v3.1 and v3.2) SHALL be extended to dispatch `HeaderValidationInputParam` inputs to `handleHeaderValidation` via the existing `buildCompositeValidationHandler` using the `validatedInputParamHeaderType` discriminator.

#### Scenario: Valid headers pass validation (v3.1 and v3.2)
- **WHEN** a request is made to `GET /users` with header `X-Request-ID: 550e8400-e29b-41d4-a716-446655440000` and the OpenAPI spec declares `X-Request-ID` as a required header parameter with `schema: { type: "string", format: "uuid" }`
- **THEN** the pipe SHALL return a record containing the validated header values

#### Scenario: Missing required header fails validation (v3.1 and v3.2)
- **WHEN** a request is made to `GET /users` without the `X-Request-ID` header and the OpenAPI spec declares `X-Request-ID` as a required header parameter (`required: true`)
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` indicating the required header is missing

#### Scenario: Invalid header value fails validation (v3.1 and v3.2)
- **WHEN** a request is made with header `X-Rate-Limit: not-a-number` and the OpenAPI spec declares `X-Rate-Limit` with `schema: { type: "integer" }`
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` containing the validation error details

#### Scenario: Optional header absent passes validation (v3.1 and v3.2)
- **WHEN** a request is made without an optional header (`required` is `false` or unset) that is declared in the OpenAPI spec
- **THEN** the pipe SHALL NOT throw an error for that header

#### Scenario: Parameter without ValidatedHeaders marker is skipped
- **WHEN** the pipe executes for a parameter that does not have the `@ValidatedHeaders()` marker
- **THEN** the pipe SHALL return the input unchanged without performing any header validation

#### Scenario: Non-object input is skipped
- **WHEN** the pipe executes and the awaited input is null or not an object
- **THEN** the pipe SHALL return the input unchanged

### Requirement: Header parameter collection merges path-item and operation-level parameters
The `handleHeaderValidation` handler SHALL collect header parameters from both `operationObject.parameters` and `pathItemObject.parameters`, with operation-level parameters overriding path-item-level parameters that share the same `name`.

#### Scenario: Operation-level parameter overrides path-item-level parameter
- **WHEN** the path item declares a header parameter `X-Version` with `schema: { type: "string" }` and the operation declares `X-Version` with `schema: { type: "string", enum: ["v1", "v2"] }`
- **THEN** the handler SHALL use the operation-level parameter definition for validation

#### Scenario: Path-item-level parameters are inherited
- **WHEN** the path item declares a header parameter `X-Tenant-ID` with `required: true` and the operation does not redeclare it
- **THEN** the handler SHALL validate `X-Tenant-ID` using the path-item-level definition

#### Scenario: $ref parameter references are resolved
- **WHEN** a parameter in the OpenAPI spec is a `$ref` reference (e.g., `{ "$ref": "#/components/parameters/ApiKeyHeader" }`)
- **THEN** the handler SHALL resolve the reference via `OpenApiResolver` and use the resolved parameter object for validation

### Requirement: Header value type coercion uses inferred schema types
The handler SHALL use `inferOpenApiSchemaTypes` to resolve the set of possible `JsonSchemaType` values from the parameter's schema (handling `allOf`, `anyOf`, `$ref`, union types, and boolean schemas). For each possible type, the handler SHALL attempt to coerce the raw header string and validate with AJV. The `"string"` candidate SHALL always be tried first when present (since HTTP headers are natively strings). The first coerced value that passes AJV validation SHALL be used. If no coercion+validation combination succeeds, the handler SHALL throw `InversifyValidationError`.

#### Scenario: Simple integer schema coercion
- **WHEN** a header `X-Rate-Limit` has value `"42"` and the schema declares `type: "integer"`
- **THEN** `inferOpenApiSchemaTypes` SHALL return `{"integer"}`, coercion SHALL produce `42`, and the returned headers record SHALL contain the coerced value

#### Scenario: Integer coercion rejects non-integer numeric value
- **WHEN** a header `X-Rate-Limit` has value `"42.5"` and the schema declares `type: "integer"`
- **THEN** coercion to integer SHALL fail (`Number.isInteger(42.5)` is `false`) and the handler SHALL throw an `InversifyValidationError`

#### Scenario: Number header coercion
- **WHEN** a header `X-Score` has value `"3.14"` and the schema declares `type: "number"`
- **THEN** coercion SHALL produce `3.14` (number) before validation

#### Scenario: Boolean header coercion
- **WHEN** a header `X-Debug` has value `"true"` and the schema declares `type: "boolean"`
- **THEN** coercion SHALL produce `true` (boolean) before validation

#### Scenario: Boolean coercion with invalid value
- **WHEN** a header `X-Debug` has value `"yes"` and the schema declares `type: "boolean"`
- **THEN** coercion to boolean SHALL fail and the handler SHALL throw an `InversifyValidationError` with kind `validationFailed`

#### Scenario: Integer coercion with non-numeric value
- **WHEN** a header `X-Rate-Limit` has value `"abc"` and the schema declares `type: "integer"`
- **THEN** coercion to integer SHALL fail (`Number("abc")` returns `NaN`) and the handler SHALL throw an `InversifyValidationError`

#### Scenario: String header no coercion
- **WHEN** a header `X-Request-ID` has value `"abc-123"` and the schema declares `type: "string"`
- **THEN** the handler SHALL pass the value as-is (no coercion needed)

#### Scenario: Union type schema with multiple possible types
- **WHEN** a header `X-Limit` has value `"42"` and the schema declares `type: ["string", "integer"]`
- **THEN** `inferOpenApiSchemaTypes` SHALL return `{"string", "integer"}`, coercion SHALL try both types, and the first coerced value that passes AJV validation SHALL be used

#### Scenario: Complex allOf schema with nested types
- **WHEN** a header `X-Value` has value `"100"` and the schema declares `{ allOf: [{ type: "integer" }, { minimum: 1 }] }`
- **THEN** `inferOpenApiSchemaTypes` SHALL resolve the intersection to `{"integer"}`, coercion SHALL produce `100`, and AJV SHALL validate it against the full schema (including `minimum: 1`)

#### Scenario: $ref schema resolved for type inference
- **WHEN** a header `X-Page-Size` references a schema via `$ref` (e.g., `{ "$ref": "#/components/schemas/PageSize" }`) and the referenced schema is `{ type: "integer", minimum: 1 }`
- **THEN** `inferOpenApiSchemaTypes` SHALL resolve the `$ref`, infer type `{"integer"}`, and coercion+validation SHALL proceed as for a direct integer schema

#### Scenario: anyOf schema with string and number
- **WHEN** a header `X-Id` has value `"abc"` and the schema declares `{ anyOf: [{ type: "string" }, { type: "number" }] }`
- **THEN** `inferOpenApiSchemaTypes` SHALL return `{"string", "number"}`, coercion SHALL try string (pass-through) and number (`NaN`), string SHALL pass AJV validation, and the returned value SHALL be `"abc"`

#### Scenario: No valid coercion+validation combination
- **WHEN** a header `X-Count` has value `"not-valid"` and the schema declares `{ type: "integer", minimum: 1 }` (inferred types: `{"integer"}`)
- **THEN** coercion to integer SHALL fail (`Number("not-valid")` is `NaN`) and the handler SHALL throw `InversifyValidationError`

#### Scenario: Array header coercion
- **WHEN** a header `X-Tags` has value `"a,b,c"` and the schema declares `type: "array"` with `items: { type: "string" }`
- **THEN** the handler SHALL split the value by comma and validate the resulting array

#### Scenario: Multi-value header (string array from adapter)
- **WHEN** a header is returned by the adapter as `string[]` (e.g., `["value1", "value2"]`) and the schema declares `type: "array"` with `items: { type: "string" }`
- **THEN** the handler SHALL validate the array directly without comma-splitting

#### Scenario: Multi-value header for non-array schema
- **WHEN** a header is returned by the adapter as `string[]` (e.g., `["value1"]`) and the schema declares `type: "string"`
- **THEN** the handler SHALL use the first element of the array for coercion and validation

### Requirement: handleHeaderValidation returns only declared headers with coerced values
After successful validation, the handler SHALL return a `Record<string, unknown>` containing only the header values declared in the OpenAPI spec (with coerced types). Undeclared headers SHALL NOT be included in the returned record.

#### Scenario: Declared headers returned with coerced types
- **WHEN** the request has headers `{ "x-rate-limit": "42", "x-request-id": "abc", "accept": "application/json" }` and the OpenAPI spec declares parameters for `X-Rate-Limit` (integer) and `X-Request-ID` (string) only
- **THEN** the handler SHALL return `{ "x-rate-limit": 42, "x-request-id": "abc" }` (excluding the undeclared `accept` header)

### Requirement: Header validation caching
The handler SHALL cache compiled AJV `ValidateFunction` instances per header name within the `ValidationCacheEntry`, reusing them across requests to the same path and method.

#### Scenario: Cached validator is reused
- **WHEN** two requests are made to `GET /users` with different `X-Request-ID` values
- **THEN** the handler SHALL compile the AJV schema for `X-Request-ID` only once and reuse the cached `ValidateFunction` for the second request

### Requirement: Export ValidatedHeaders from package root
The `@inversifyjs/open-api-validation` package root export (`"."`) SHALL export both `ValidatedBody` and `ValidatedHeaders`.

#### Scenario: Importing ValidatedHeaders
- **WHEN** a consumer imports `{ ValidatedHeaders }` from `@inversifyjs/open-api-validation`
- **THEN** `ValidatedHeaders` SHALL be the shared custom parameter decorator

### Requirement: Header validation errors integrate with InversifyValidationErrorFilter
The handler SHALL throw `InversifyValidationError` with kind `validationFailed` when header validation fails. This integrates with the existing `InversifyValidationErrorFilter` for HTTP 400 responses.

#### Scenario: Validation error is caught by error filter
- **WHEN** the handler throws an `InversifyValidationError` due to a header validation failure
- **AND** the `InversifyValidationErrorFilter` is registered as a global error filter
- **THEN** the HTTP response SHALL have status code 400 and contain the validation error message

### Requirement: Header name matching is case-insensitive
The handler SHALL match header names case-insensitively, per HTTP specification (RFC 7230).

#### Scenario: Case-insensitive header matching
- **WHEN** the OpenAPI spec declares a parameter with name `X-Request-ID` and the request contains header `x-request-id: abc`
- **THEN** the handler SHALL match and validate the header value correctly
