## ADDED Requirements

### Requirement: SwaggerUiProvider exposes the OpenAPI object
The `SwaggerUiProvider` (both v3.1 and v3.2 implementations) SHALL expose the `openApiObject` via a public getter. The getter SHALL return the same object reference passed via `options.api.openApiObject`.

#### Scenario: Accessing the OpenAPI object after provide
- **WHEN** `SwaggerUiProvider.provide(container)` has been called
- **THEN** `swaggerUiProvider.openApiObject` SHALL return the fully populated OpenAPI object with paths and component schemas

#### Scenario: Accessing the OpenAPI object before provide
- **WHEN** `SwaggerUiProvider` is constructed but `provide()` has not yet been called
- **THEN** `swaggerUiProvider.openApiObject` SHALL return the original (unpopulated) OpenAPI object reference

### Requirement: Export OpenAPI metadata utilities per version
The `@inversifyjs/http-open-api` package SHALL export `controllerOpenApiMetadataReflectKey`, the `ControllerOpenApiMetadata` type, and a `getControllerOpenApiMetadata(target)` helper from each version subpath (`index.ts` for v3.1 and `v3Dot2.ts` for v3.2).

#### Scenario: Importing v3.1 metadata utilities
- **WHEN** a consumer imports `getControllerOpenApiMetadata` and `controllerOpenApiMetadataReflectKey` from `@inversifyjs/http-open-api` (or `@inversifyjs/http-open-api/v3Dot1`)
- **THEN** the imports SHALL resolve to the v3.1 reflect key and the helper that reads v3.1 `ControllerOpenApiMetadata` from a controller class

#### Scenario: Importing v3.2 metadata utilities
- **WHEN** a consumer imports `getControllerOpenApiMetadata` and `controllerOpenApiMetadataReflectKey` from `@inversifyjs/http-open-api/v3Dot2`
- **THEN** the imports SHALL resolve to the v3.2 reflect key and the helper that reads v3.2 `ControllerOpenApiMetadata` from a controller class

#### Scenario: getControllerOpenApiMetadata reads metadata from a decorated controller
- **WHEN** `getControllerOpenApiMetadata(target)` is called with a controller class that has been decorated with OpenAPI decorators
- **THEN** it SHALL return the `ControllerOpenApiMetadata` for that controller, or `undefined` if no metadata exists

### Requirement: ValidatedBody custom parameter decorator extracts body and request context
The `@ValidatedBody()` decorator SHALL be a custom parameter decorator (built with `createCustomParameterDecorator` from `@inversifyjs/http-core`) that:
1. Stores a validation marker in reflect metadata under a dedicated key (`openApiValidationMetadataReflectKey`) at the parameter's index.
2. Extracts from the request: the body (via `options.getBody`), HTTP method (via `options.getMethod`), URL (via `options.getUrl`), and Content-Type header (via `options.getHeaders`).
3. Parses the Content-Type header to extract the base MIME type (stripping parameters like `charset=utf-8`).
4. Returns a `BodyValidationInputParam` object containing the body, method, URL, content type, and a `type` discriminator symbol (`validatedInputParamBodyType`).

The decorator is version-agnostic and exported from the package's root (`@inversifyjs/http-openapi-validation`).

#### Scenario: ValidatedBody applied to a controller method parameter
- **WHEN** `@ValidatedBody()` is applied to a controller method parameter
- **THEN** the parameter's reflect metadata (under `openApiValidationMetadataReflectKey`) SHALL contain a `true` marker at the parameter index
- **AND** at runtime, the custom parameter handler SHALL extract body, method, URL, and Content-Type from the request and return a `BodyValidationInputParam`

#### Scenario: Content-Type header is present
- **WHEN** the request has a `Content-Type` header (e.g., `application/json; charset=utf-8`)
- **THEN** the decorator SHALL parse it to `application/json` and include it in the `BodyValidationInputParam.contentType`

#### Scenario: Content-Type header is absent
- **WHEN** the request has no `Content-Type` header
- **THEN** the `BodyValidationInputParam.contentType` SHALL be `undefined`

#### Scenario: Content-Type header is an array
- **WHEN** the `Content-Type` header is returned as an array (e.g., `['application/json']`)
- **THEN** the decorator SHALL use the first element, or `undefined` if the array is empty

### Requirement: OpenApiValidationPipe validates body against OpenAPI schema (version-specific)
The `OpenApiValidationPipe` SHALL be provided as version-specific implementations: one for OpenAPI 3.1 (exported from `./v3Dot1` subpath) and one for OpenAPI 3.2 (exported from `./v3Dot2` subpath). Each version's pipe SHALL implement the `Pipe` interface. On `execute(input, metadata)`, it SHALL:
1. Await the input (to handle async custom decorators).
2. Use `getControllerMethodParameterMetadataList` with `metadata.targetClass` and `metadata.methodName` to retrieve the parameter metadata for the parameter at `metadata.parameterIndex`.
3. Check that the `@ValidatedBody()` marker is present in the dedicated reflect key.
4. If the marker is absent or the parameter metadata is undefined, return the input unchanged.
5. If the awaited input is null or not an object, return it unchanged.
6. Lazily initialize Ajv and load the full OpenAPI spec.
7. Delegate to `buildCompositeValidationHandler` which dispatches based on the input's `type` discriminator to `handleBodyValidation`.
8. `handleBodyValidation` extracts path, method, and content type from the `BodyValidationInputParam`, resolves the OpenAPI operation and request body, constructs a JSON pointer, validates with Ajv, and throws `InversifyValidationError` on failure.

#### Scenario: Valid body passes validation (v3.1 and v3.2)
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body matching the `CreateUserRequest` schema defined in the OpenAPI spec
- **THEN** the pipe SHALL return the body unchanged

#### Scenario: Invalid body fails validation (v3.1 and v3.2)
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body missing required fields or violating constraints defined in the OpenAPI spec
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` containing the validation error details

#### Scenario: Parameter without ValidatedBody marker is skipped
- **WHEN** the pipe executes for a parameter that does not have the `@ValidatedBody()` marker
- **THEN** the pipe SHALL return the input unchanged without performing any validation

#### Scenario: Non-object input is skipped
- **WHEN** the pipe executes and the awaited input is null or not an object
- **THEN** the pipe SHALL return the input unchanged without performing any validation

### Requirement: Content-type resolution for body validation
The `handleBodyValidation` function SHALL resolve the content type from the `BodyValidationInputParam`:

#### Scenario: Content-Type is provided in the input
- **WHEN** `BodyValidationInputParam.contentType` is defined (extracted from the request header by `@ValidatedBody()`)
- **THEN** the handler SHALL use that content type to locate the schema in `requestBody.content`

#### Scenario: Content-Type is absent and exactly one content type is declared
- **WHEN** `BodyValidationInputParam.contentType` is `undefined` and the endpoint's `requestBody.content` declares exactly one content type
- **THEN** the handler SHALL assume the body is of that content type and use its schema for validation

#### Scenario: Content-Type is absent and multiple content types are declared
- **WHEN** `BodyValidationInputParam.contentType` is `undefined` and the endpoint's `requestBody.content` declares more than one content type
- **THEN** the handler SHALL throw an `InversifyValidationError` with kind `validationFailed` indicating that the content type cannot be determined

### Requirement: OpenApiValidationPipe initializes ajv lazily
The `OpenApiValidationPipe` SHALL NOT initialize `ajv` or load the OpenAPI schema at construction time. It SHALL defer initialization to the first `execute()` call.

#### Scenario: Spec is fully populated before first request
- **WHEN** the `OpenApiValidationPipe` is instantiated before `SwaggerUiProvider.provide()` has populated the OpenAPI spec, but `provide()` completes before the first HTTP request is handled
- **THEN** the pipe SHALL successfully load the fully populated spec on the first `execute()` call and validate correctly

#### Scenario: ajv is initialized only once
- **WHEN** the pipe's `execute()` method is called multiple times
- **THEN** `ajv.addSchema()` SHALL be called only once (on the first invocation), and subsequent calls SHALL reuse the compiled schemas

### Requirement: OpenApiValidationPipe constructor accepts version-specific OpenAPI spec
The v3.1 `OpenApiValidationPipe` constructor SHALL accept an `OpenApi3Dot1Object`. The v3.2 `OpenApiValidationPipe` constructor SHALL accept an `OpenApi3Dot2Object`. No content-type provider callback is needed since `@ValidatedBody()` extracts the content type directly from the request.

#### Scenario: Pipe receives the shared OpenAPI spec object (v3.1)
- **WHEN** `OpenApiValidationPipe` is constructed with the same `OpenApi3Dot1Object` instance used by the v3.1 `SwaggerUiProvider`
- **THEN** the pipe SHALL have access to the fully populated spec (paths, schemas) after `SwaggerUiProvider.provide()` completes

#### Scenario: Pipe receives the shared OpenAPI spec object (v3.2)
- **WHEN** `OpenApiValidationPipe` is constructed with the same `OpenApi3Dot2Object` instance used by the v3.2 `SwaggerUiProvider`
- **THEN** the pipe SHALL have access to the fully populated spec (paths, schemas) after `SwaggerUiProvider.provide()` completes

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

### Requirement: Subpath exports for http-openapi-validation package
The `@inversifyjs/http-openapi-validation` package SHALL provide subpath exports: `"."` for the shared `ValidatedBody` decorator, `"./v3Dot1"` for the v3.1 `OpenApiValidationPipe`, and `"./v3Dot2"` for the v3.2 `OpenApiValidationPipe`.

#### Scenario: Importing ValidatedBody (root export)
- **WHEN** a consumer imports `{ ValidatedBody }` from `@inversifyjs/http-openapi-validation`
- **THEN** `ValidatedBody` SHALL be the shared custom parameter decorator

#### Scenario: Importing v3.1 pipe
- **WHEN** a consumer imports `{ OpenApiValidationPipe }` from `@inversifyjs/http-openapi-validation/v3Dot1`
- **THEN** `OpenApiValidationPipe` SHALL be the v3.1 validation pipe

#### Scenario: Importing v3.2 pipe
- **WHEN** a consumer imports `{ OpenApiValidationPipe }` from `@inversifyjs/http-openapi-validation/v3Dot2`
- **THEN** `OpenApiValidationPipe` SHALL be the v3.2 validation pipe
