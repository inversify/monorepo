## Why

Developers using both `@inversifyjs/http-open-api` decorators and validation must currently define schemas twice: once for OpenAPI documentation and once for runtime validation. This duplication leads to inconsistencies and extra maintenance. By reusing OpenAPI metadata as a validation source — starting with request bodies — we establish a single source of truth and make OpenAPI decorators operational, not just descriptive. This addresses [inversify/monorepo#1701](https://github.com/inversify/monorepo/issues/1701).

## What Changes

- **Expose the OpenAPI object from `SwaggerUiProvider`** (both v3.1 and v3.2 versions) via a public `openApiObject` getter so consumers (including validation pipes) can access the fully populated spec after `provide()` completes.
- **Export OpenAPI metadata utilities from `@inversifyjs/http-open-api`** per version subpath: export `controllerOpenApiMetadataReflectKey`, the `ControllerOpenApiMetadata` type, and a `getControllerOpenApiMetadata(target)` helper function. These allow the validation pipe (and other consumers) to read the OpenAPI metadata stored by OAS decorators on controller classes.
- **Create a new `@inversifyjs/http-openapi-validation` package** (at `packages/framework/http/libraries/openapi-validation/`) providing OpenAPI-driven body validation with **multi-version support** mirroring the `@inversifyjs/http-open-api` subpath export pattern (`./v3Dot1`, `./v3Dot2`).
- Provide a shared `@Validate()` parameter decorator that opts a parameter into OpenAPI-based validation (version-agnostic — works with any version's pipe). The decorator stores a marker in reflect metadata (using its own dedicated key, following the `@ValidateAjvSchema` pattern). The `OpenApiValidationPipe` is registered by the user as a global pipe and reads this marker.
- Provide **version-specific validation pipes**: `OpenApiValidationPipe` for v3.1 and `OpenApiValidationPipe` for v3.2, each implementing `Pipe`. Each pipe:
  - Accepts the version-appropriate OpenAPI object (e.g., `OpenApi3Dot1Object` or `OpenApi3Dot2Object`) and an optional content-type provider callback.
  - Loads the OpenAPI spec document into `ajv` with `ajv-formats` lazily on first `execute()`.
  - Uses the version-specific `getControllerOpenApiMetadata` utility to read OAS metadata from the controller.
  - On each request, reads the parameter metadata to determine if the parameter is a body (`RequestMethodParameterType.Body`) and has the `@Validate()` marker.
  - Resolves the request's content type: uses the `Content-Type` header if present; if absent and only one content type is declared for the endpoint, assumes that one; otherwise throws a validation error.
  - Retrieves the appropriate JSON schema from the OpenAPI spec via JSON pointer (`#/paths/.../requestBody/content/.../schema`) and validates the body against it using `ajv`.
  - Throws `InversifyValidationError` on validation failure (caught by `InversifyValidationErrorFilter` → HTTP 400).
- Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core` so the validation pipe can inspect parameter types.
- Scope is deliberately limited to **body validation only** in this first iteration — no query, header, or response validation.

## Capabilities

### New Capabilities
- `openapi-body-validation`: Provides `@Validate()` decorator and version-specific `OpenApiValidationPipe` (v3.1 and v3.2) for validating request bodies against OpenAPI schemas using `ajv`.

### Modified Capabilities
- `@inversifyjs/http-open-api`: `SwaggerUiProvider` now exposes the `openApiObject` via a public getter. New metadata utility exports (`controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata`, `getControllerOpenApiMetadata`) per version subpath.

## Impact

- **New package**: `@inversifyjs/http-openapi-validation` with dependencies on `@inversifyjs/http-core`, `@inversifyjs/http-open-api`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `@inversifyjs/reflect-metadata-utils`, and `@inversifyjs/prototype-utils`; peer dependencies on `ajv@^8` and `ajv-formats`. The package provides subpath exports mirroring `@inversifyjs/http-open-api`: default/`./v3Dot1` for OpenAPI 3.1 and `./v3Dot2` for OpenAPI 3.2.
- **Modified package**: `@inversifyjs/http-core` — new public export of `getControllerMethodParameterMetadataList` (non-breaking addition).
- **Modified package**: `@inversifyjs/http-open-api` — `SwaggerUiProvider` gains a public `openApiObject` getter (both versions). New public exports: `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` helper per version subpath (non-breaking additions).
- **Adapter-agnostic**: Works with any HTTP adapter (Express, Fastify, Hono, uWebSockets) because it operates at the `Pipe` level, which is adapter-independent.
- **Peer dependencies**: `ajv@^8` and `ajv-formats` as peer deps of the new package.
