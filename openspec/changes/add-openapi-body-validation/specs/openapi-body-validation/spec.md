## ADDED Requirements

### Requirement: Validate decorator marks parameter for OpenAPI validation
The `@Validate()` parameter decorator SHALL store a marker in reflect metadata indicating that the decorated parameter should be validated against the OpenAPI spec. It SHALL also add an `OpenApiValidationPipe` service identifier to the parameter's pipe list.

#### Scenario: Validate decorator applied to a body parameter
- **WHEN** `@Validate()` is applied alongside `@Body()` on a controller method parameter
- **THEN** the parameter's reflect metadata SHALL contain the OpenAPI validation marker
- **AND** the parameter's `pipeList` SHALL include the `OpenApiValidationPipe` service identifier

#### Scenario: Validate decorator applied without Body
- **WHEN** `@Validate()` is applied to a parameter that is not decorated with `@Body()` (e.g., `@Query()`)
- **THEN** the decorator SHALL still store the marker (no error at decoration time)
- **AND** at runtime, the pipe SHALL skip validation for non-body parameters

### Requirement: OpenApiValidationPipe validates body against OpenAPI schema
The `OpenApiValidationPipe` SHALL implement the `Pipe` interface. On `execute(input, metadata)`, it SHALL:
1. Use `getControllerMethodParameterMetadataList` with `metadata.targetClass` and `metadata.methodName` to retrieve the parameter metadata for the parameter at `metadata.parameterIndex`.
2. Check that the parameter type is `RequestMethodParameterType.Body` and that the `@Validate()` marker is present.
3. If the parameter is not a body or the marker is absent, return the input unchanged.
4. Resolve the HTTP method and path pattern from the controller's method metadata.
5. Determine the content type (see content-type resolution requirement).
6. Construct a JSON pointer into the OpenAPI spec to locate the request body schema for the resolved path, method, and content type.
7. Validate the input against the compiled schema using `ajv`.
8. If validation passes, return the input unchanged.
9. If validation fails, throw an `InversifyValidationError` with kind `validationFailed`.

#### Scenario: Valid body passes validation
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body matching the `CreateUserRequest` schema defined in the OpenAPI spec
- **THEN** the pipe SHALL return the body unchanged

#### Scenario: Invalid body fails validation
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body missing required fields or violating constraints defined in the OpenAPI spec
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` containing the validation error details

#### Scenario: Non-body parameter is skipped
- **WHEN** the pipe executes for a parameter whose type is not `RequestMethodParameterType.Body`
- **THEN** the pipe SHALL return the input unchanged without performing any validation

#### Scenario: Parameter without Validate marker is skipped
- **WHEN** the pipe executes for a body parameter that does not have the `@Validate()` marker
- **THEN** the pipe SHALL return the input unchanged without performing any validation

### Requirement: Content-type resolution for body validation
The `OpenApiValidationPipe` SHALL resolve the content type of the request to select the appropriate schema from the OpenAPI spec's `requestBody.content` map.

#### Scenario: Content-Type header is present and matches a declared content type
- **WHEN** the request has a `Content-Type` header (e.g., `application/json; charset=utf-8`) and the base media type (`application/json`) matches a content type declared in the endpoint's `requestBody.content`
- **THEN** the pipe SHALL use that content type's schema for validation

#### Scenario: Content-Type header is absent and exactly one content type is declared
- **WHEN** the request has no `Content-Type` header and the endpoint's `requestBody.content` declares exactly one content type
- **THEN** the pipe SHALL assume the body is of that content type and use its schema for validation

#### Scenario: Content-Type header is absent and multiple content types are declared
- **WHEN** the request has no `Content-Type` header and the endpoint's `requestBody.content` declares more than one content type
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` indicating that the content type cannot be determined

#### Scenario: Content-Type header does not match any declared content type
- **WHEN** the request has a `Content-Type` header whose base media type does not match any content type declared in the endpoint's `requestBody.content`
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` indicating an unsupported content type

### Requirement: OpenApiValidationPipe initializes ajv lazily
The `OpenApiValidationPipe` SHALL NOT initialize `ajv` or load the OpenAPI schema at construction time. It SHALL defer initialization to the first `execute()` call.

#### Scenario: Spec is fully populated before first request
- **WHEN** the `OpenApiValidationPipe` is instantiated before `SwaggerUiProvider.provide()` has populated the OpenAPI spec, but `provide()` completes before the first HTTP request is handled
- **THEN** the pipe SHALL successfully load the fully populated spec on the first `execute()` call and validate correctly

#### Scenario: ajv is initialized only once
- **WHEN** the pipe's `execute()` method is called multiple times
- **THEN** `ajv.addSchema()` SHALL be called only once (on the first invocation), and subsequent calls SHALL reuse the compiled schemas

### Requirement: OpenApiValidationPipe constructor accepts OpenAPI spec
The `OpenApiValidationPipe` constructor SHALL accept an `OpenApi3Dot1Object` representing the OpenAPI specification document. This is the same object instance passed to `SwaggerUiProvider`.

#### Scenario: Pipe receives the shared OpenAPI spec object
- **WHEN** `OpenApiValidationPipe` is constructed with the same `OpenApi3Dot1Object` instance used by `SwaggerUiProvider`
- **THEN** the pipe SHALL have access to the fully populated spec (paths, schemas) after `SwaggerUiProvider.provide()` completes

### Requirement: OpenApiValidationPipe resolves route path and HTTP method from controller metadata
The pipe SHALL determine the OpenAPI path pattern and HTTP method for the current handler by reading the controller's class-level and method-level metadata.

#### Scenario: Controller with class-level and method-level path
- **WHEN** a controller is decorated with `@Controller('/users')` and a method with `@Post('/')`
- **THEN** the pipe SHALL resolve the path as `/users` (or `/users/` normalized) and the method as `post`

#### Scenario: Controller with nested path segments
- **WHEN** a controller is decorated with `@Controller('/api/v1')` and a method with `@Put('/:id')`
- **THEN** the pipe SHALL resolve the combined path and the method as `put`

### Requirement: Export getControllerMethodParameterMetadataList from http-core
The `@inversifyjs/http-core` package SHALL export `getControllerMethodParameterMetadataList` from its public barrel (`src/index.ts`).

#### Scenario: Importing from http-core
- **WHEN** a consumer imports `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`
- **THEN** the import SHALL resolve to the function that retrieves parameter metadata for a controller method

### Requirement: OpenApiValidationPipe uses ajv with strict mode disabled and formats enabled
The pipe SHALL configure `ajv` with `strict: false` (to tolerate OpenAPI-specific keywords) and SHALL add standard formats via `ajv-formats`.

#### Scenario: OpenAPI spec with format constraints
- **WHEN** the OpenAPI spec declares a property with `format: "email"` and the request body contains an invalid email
- **THEN** the pipe SHALL report a format validation error

#### Scenario: OpenAPI-specific keywords do not cause errors
- **WHEN** the OpenAPI spec contains keywords like `openapi`, `info`, `paths`, `servers` at the top level
- **THEN** `ajv` SHALL NOT throw strict mode errors during schema loading

### Requirement: Validation errors integrate with InversifyValidationErrorFilter
The `OpenApiValidationPipe` SHALL throw `InversifyValidationError` with kind `validationFailed` when validation fails. This integrates with the existing `InversifyValidationErrorFilter` which converts these errors to HTTP 400 responses.

#### Scenario: Validation error is caught by error filter
- **WHEN** the pipe throws an `InversifyValidationError` due to a body validation failure
- **AND** the `InversifyValidationErrorFilter` is registered as a global error filter
- **THEN** the HTTP response SHALL have status code 400 and contain the validation error message
