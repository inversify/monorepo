## MODIFIED Requirements

### Requirement: OpenApiValidationPipe validates body against OpenAPI schema (version-specific)
The `OpenApiValidationPipe` SHALL be provided as version-specific implementations: one for OpenAPI 3.1 (exported from `./v3Dot1` subpath) and one for OpenAPI 3.2 (exported from `./v3Dot2` subpath). Each version's pipe SHALL implement the `Pipe` interface. On `execute(input, metadata)`, it SHALL:
1. Await the input (to handle async custom decorators).
2. Use `getControllerMethodParameterMetadataList` with `metadata.targetClass` and `metadata.methodName` to retrieve the parameter metadata for the parameter at `metadata.parameterIndex`.
3. Check that the `@ValidatedBody()` or `@ValidatedHeaders()` marker is present in the dedicated reflect key.
4. If the marker is absent or the parameter metadata is undefined, return the input unchanged.
5. If the awaited input is null or not an object, return it unchanged.
6. Lazily initialize Ajv and load the full OpenAPI spec.
7. Delegate to `buildCompositeValidationHandler` which dispatches based on the input's `type` discriminator to `handleBodyValidation` or `handleHeaderValidation`.

#### Scenario: Valid body passes validation (v3.1 and v3.2)
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body matching the `CreateUserRequest` schema defined in the OpenAPI spec
- **THEN** the pipe SHALL return the body unchanged

#### Scenario: Invalid body fails validation (v3.1 and v3.2)
- **WHEN** a request is made to `POST /users` with `Content-Type: application/json` and a body missing required fields or violating constraints defined in the OpenAPI spec
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` containing the validation error details

#### Scenario: Valid headers pass validation (v3.1 and v3.2)
- **WHEN** a request is made with all required headers matching the parameter schemas in the OpenAPI spec
- **THEN** the pipe SHALL return a record of validated header values

#### Scenario: Invalid headers fail validation (v3.1 and v3.2)
- **WHEN** a request is made with headers that violate parameter schemas in the OpenAPI spec
- **THEN** the pipe SHALL throw an `InversifyValidationError` with kind `validationFailed` containing the validation error details

#### Scenario: Parameter without ValidatedBody or ValidatedHeaders marker is skipped
- **WHEN** the pipe executes for a parameter that does not have the `@ValidatedBody()` or `@ValidatedHeaders()` marker
- **THEN** the pipe SHALL return the input unchanged without performing any validation

#### Scenario: Non-object input is skipped
- **WHEN** the pipe executes and the awaited input is null or not an object
- **THEN** the pipe SHALL return the input unchanged without performing any validation
