## Why

Developers using both `@inversifyjs/http-open-api` decorators and validation must currently define schemas twice: once for OpenAPI documentation and once for runtime validation. This duplication leads to inconsistencies and extra maintenance. By reusing OpenAPI metadata as a validation source — starting with request bodies — we establish a single source of truth and make OpenAPI decorators operational, not just descriptive. This addresses [inversify/monorepo#1701](https://github.com/inversify/monorepo/issues/1701).

## What Changes

- Create a new `@inversifyjs/http-openapi-validation` package (at `packages/framework/http/libraries/openapi-validation/`) providing OpenAPI-driven body validation.
- Provide a `@Validate()` parameter decorator that opts a parameter into OpenAPI-based validation.
- Provide an `OpenApiValidationPipe` (implementing `Pipe`) that:
  - Loads the OpenAPI spec document (provided by `SwaggerProvider`) into `ajv` with `ajv-formats`.
  - On each request, reads the parameter metadata to determine if the parameter is a body (`RequestMethodParameterType.Body`).
  - Resolves the request's content type: uses the `Content-Type` header if present; if absent and only one content type is declared for the endpoint, assumes that one; otherwise throws a validation error.
  - Retrieves the appropriate JSON schema from the OpenAPI spec via JSON pointer (`#/paths/.../requestBody/content/.../schema`) and validates the body against it using `ajv`.
  - Throws `InversifyValidationError` on validation failure (caught by `InversifyValidationErrorFilter` → HTTP 400).
- Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core` so the validation pipe can inspect parameter types.
- Scope is deliberately limited to **body validation only** in this first iteration — no query, header, or response validation.

## Capabilities

### New Capabilities
- `openapi-body-validation`: Provides `@Validate()` decorator and `OpenApiValidationPipe` for validating request bodies against OpenAPI schemas using `ajv`.

### Modified Capabilities

_(none — no existing specs are modified)_

## Impact

- **New package**: `@inversifyjs/http-openapi-validation` with dependencies on `@inversifyjs/http-core`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `ajv`, and `ajv-formats`.
- **Modified package**: `@inversifyjs/http-core` — new public export of `getControllerMethodParameterMetadataList` (non-breaking addition).
- **Adapter-agnostic**: Works with any HTTP adapter (Express, Fastify, Hono, uWebSockets) because it operates at the `Pipe` level, which is adapter-independent.
- **Peer dependencies**: `ajv@^8` and `ajv-formats` as peer deps of the new package.
