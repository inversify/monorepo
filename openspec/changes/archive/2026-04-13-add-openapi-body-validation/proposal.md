## Why

Developers using both `@inversifyjs/http-open-api` decorators and validation must currently define schemas twice: once for OpenAPI documentation and once for runtime validation. This duplication leads to inconsistencies and extra maintenance. By reusing OpenAPI metadata as a validation source — starting with request bodies — we establish a single source of truth and make OpenAPI decorators operational, not just descriptive. This addresses [inversify/monorepo#1701](https://github.com/inversify/monorepo/issues/1701).

## What Changes

- **Expose the OpenAPI object from `SwaggerUiProvider`** (both v3.1 and v3.2 versions) via a public `openApiObject` getter so consumers (including validation pipes) can access the fully populated spec after `provide()` completes.
- **Export OpenAPI metadata utilities from `@inversifyjs/http-open-api`** per version subpath: export `controllerOpenApiMetadataReflectKey`, the `ControllerOpenApiMetadata` type, and a `getControllerOpenApiMetadata(target)` helper function. These allow the validation pipe (and other consumers) to read the OpenAPI metadata stored by OAS decorators on controller classes.
- **Create a new `@inversifyjs/open-api-validation` package** (at `packages/framework/http/libraries/openapi-validation/`) providing OpenAPI-driven body validation with **multi-version support** via subpath exports (`./v3Dot1`, `./v3Dot2` for pipes, `"."` for the shared decorator).
- Provide a shared `@ValidatedBody()` custom parameter decorator (version-agnostic) that:
  - Stores a validation marker in reflect metadata (using a dedicated key).
  - Uses `createCustomParameterDecorator` from `@inversifyjs/http-core` to extract the body, HTTP method, URL, and Content-Type header from the request, packaging them into a `BodyValidationInputParam` object.
  - This design replaces the original `@Validate()` + `@Body()` approach because the pipe needs request context (method, URL, content-type) that `PipeMetadata` does not provide and a plain `@Body()` value does not contain.
- Provide **version-specific validation pipes**: `OpenApiValidationPipe` for v3.1 and `OpenApiValidationPipe` for v3.2, each implementing `Pipe`. Each pipe:
  - Accepts only the version-appropriate OpenAPI object (e.g., `OpenApi3Dot1Object` or `OpenApi3Dot2Object`) — no content-type provider callback needed since `@ValidatedBody()` extracts it from the request.
  - Loads the OpenAPI spec document into `ajv` with `ajv-formats` lazily on first `execute()`.
  - On each request, reads the parameter metadata to check the `@ValidatedBody()` marker; skips unmarked parameters.
  - Delegates to a discriminator-based composite handler that dispatches based on the input's `type` field to `handleBodyValidation`.
  - `handleBodyValidation` extracts path/method/contentType from the input, resolves the OpenAPI operation and request body, constructs a JSON pointer, validates with Ajv, and throws `InversifyValidationError` on failure.
- Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core` so the validation pipe can inspect parameter metadata.
- Scope is deliberately limited to **body validation only** in this first iteration — no query, header, or response validation.

## Capabilities

### New Capabilities
- `openapi-body-validation`: Provides `@ValidatedBody()` custom parameter decorator and version-specific `OpenApiValidationPipe` (v3.1 and v3.2) for validating request bodies against OpenAPI schemas using `ajv`.

### Modified Capabilities
- `@inversifyjs/http-open-api`: `SwaggerUiProvider` now exposes the `openApiObject` via a public getter. New metadata utility exports (`controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata`, `getControllerOpenApiMetadata`) per version subpath.

## Impact

- **New package**: `@inversifyjs/open-api-validation` with dependencies on `@inversifyjs/http-core`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `@inversifyjs/reflect-metadata-utils`, `@inversifyjs/json-schema-pointer`, `@inversifyjs/json-schema-types`, and `@inversifyjs/open-api-types`; peer dependencies on `ajv@^8` and `ajv-formats`. The package provides subpath exports: `"."` for the shared `ValidatedBody` decorator, `"./v3Dot1"` for the v3.1 pipe, and `"./v3Dot2"` for the v3.2 pipe.
- **Modified package**: `@inversifyjs/http-core` — new public export of `getControllerMethodParameterMetadataList` (non-breaking addition).
- **Modified package**: `@inversifyjs/http-open-api` — `SwaggerUiProvider` gains a public `openApiObject` getter (both versions). New public exports: `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` helper per version subpath (non-breaking additions).
- **Adapter-agnostic**: Works with any HTTP adapter (Express, Fastify, Hono, uWebSockets) because it operates at the `Pipe` level, which is adapter-independent.
- **Peer dependencies**: `ajv@^8` and `ajv-formats` as peer deps of the new package.
