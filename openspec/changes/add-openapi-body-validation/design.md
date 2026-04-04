## Context

The `@inversifyjs/http-open-api` package lets developers annotate controllers with OpenAPI decorators (`@OasRequestBody`, `@OasSchema`, etc.). The package now supports **multiple OpenAPI versions** via subpath exports: `@inversifyjs/http-open-api` (default, v3.1), `@inversifyjs/http-open-api/v3Dot1`, and `@inversifyjs/http-open-api/v3Dot2`. Each version has its own `SwaggerUiProvider`, reflect metadata keys, and type definitions. The `SwaggerUiProvider` collects OAS metadata and populates the version-appropriate OpenAPI object (`OpenApi3Dot1Object` or `OpenApi3Dot2Object`) at runtime, including `paths` and `components.schemas`.

Key architectural facts about the multi-version structure:
- **Reflect metadata keys are version-separated**: v3.1 uses `@inversifyjs/http-open-api/controllerOpenApiMetadataReflectKey`, v3.2 uses `@inversifyjs/http-open-api/v3Dot2/controllerOpenApiMetadataReflectKey`. This prevents metadata collisions when both versions are used in the same application.
- **`ControllerOpenApiMetadata` differs per version**: the `methodToOperationObjectMap` holds version-specific operation objects (`OpenApi3Dot1OperationObject` vs `OpenApi3Dot2OperationObject`).
- **`SwaggerUiProvider`** is version-specific but has identical logic — only the OpenAPI types it works with differ.
- **The OpenAPI object is not exposed** from `SwaggerUiProvider` — it is passed via constructor options (`api.openApiObject`) and mutated in-place during `provide()`, but there is no public getter.
- **`controllerOpenApiMetadataReflectKey` and `ControllerOpenApiMetadata` are not publicly exported** from `@inversifyjs/http-open-api`.

Separately, validation packages (`@inversifyjs/ajv-validation`, `@inversifyjs/standard-schema-validation`) require developers to redefine schemas for runtime validation, leading to duplication.

The framework's pipe system (`Pipe.execute(input, metadata)`) is adapter-agnostic and provides `PipeMetadata` containing `targetClass`, `methodName`, and `parameterIndex`. Pipes can be added to a parameter's `pipeList` via decorators (per-parameter pipes) or registered globally. The `@Body()` decorator sets `parameterType: RequestMethodParameterType.Body` in the controller method's parameter metadata.

Currently, `getControllerMethodParameterMetadataList` (which retrieves per-parameter metadata from the controller constructor) is internal to `@inversifyjs/http-core` and not exported.

A PoC has validated that `ajv` (with `ajv-formats`) can load an entire OpenAPI 3.1 document via `addSchema(openapiDoc, id)` and then compile individual request body schemas using JSON pointers like `ajv.getSchema("id#/paths/~1users/post/requestBody/content/application~1json/schema")`. This resolves `$ref` references automatically. The same approach works for OpenAPI 3.2 documents, since both versions are JSON Schema-compatible.

## Goals / Non-Goals

**Goals:**
- Enable body validation using existing OpenAPI metadata as the single source of truth.
- Support both OpenAPI 3.1 and OpenAPI 3.2 via version-specific validation pipes.
- Expose the OpenAPI object from `SwaggerUiProvider` so consumers can access the fully populated spec.
- Provide metadata utility exports from `@inversifyjs/http-open-api` per version to enable external packages to read controller OpenAPI metadata.
- Provide an explicit opt-in `@Validate()` parameter decorator so validation is not silently applied.
- Work across all HTTP adapters (adapter-agnostic, at the `Pipe` level).
- Throw `InversifyValidationError` to integrate with the existing `InversifyValidationErrorFilter` (HTTP 400).
- Validate based on the request's `Content-Type` to apply the correct schema when multiple content types are declared.

**Non-Goals:**
- Response validation.
- Query, header, path, or cookie parameter validation (deferred to future iterations).
- Replacing or deprecating existing validation packages (`ajv-validation`, `standard-schema-validation`).
- Providing a standalone validation service (e.g., for `@Request()` handlers) — deferred.

## Decisions

### 1. New package: `@inversifyjs/http-openapi-validation` with multi-version subpath exports

**Decision**: Create a new package at `packages/framework/http/libraries/openapi-validation/` with subpath exports mirroring `@inversifyjs/http-open-api`: default/`./v3Dot1` for OpenAPI 3.1 and `./v3Dot2` for OpenAPI 3.2.

**Rationale**: The feature bridges `http-core` (pipe system, parameter metadata) and `open-api` (OpenAPI spec, schema generation). Placing it in a separate package avoids coupling the core HTTP layer to ajv or OpenAPI concerns. The multi-version subpath export pattern mirrors `@inversifyjs/http-open-api` and is natural for consumers already familiar with that convention.

The `@Validate()` decorator is shared (version-agnostic) since it just stores a marker. The `OpenApiValidationPipe` is version-specific because it needs version-specific metadata utilities and OpenAPI types.

**Package structure:**
```
src/
  index.ts           # v3.1 (default): exports @Validate, OpenApiValidationPipe for v3.1
  v3Dot2.ts          # v3.2: exports @Validate, OpenApiValidationPipe for v3.2
  common/
    decorators/
      Validate.ts    # Shared decorator (version-agnostic)
    reflectMetadata/
      ...            # Shared metadata key for @Validate marker
  v3Dot1/
    pipes/
      OpenApiValidationPipe.ts
  v3Dot2/
    pipes/
      OpenApiValidationPipe.ts
```

**Alternatives considered**:
- Adding to `@inversifyjs/http-open-api`: rejected because validation is a distinct concern from spec generation / Swagger UI.
- Adding to `@inversifyjs/http-validation`: rejected because that package is framework-agnostic (works with any validation source), whereas this is specifically OpenAPI-driven.
- A single non-versioned pipe with generics: rejected because each version needs version-specific reflect key access and the metadata types differ. Version-specific pipes are clearer.

### 2. Expose the OpenAPI object from `SwaggerUiProvider`

**Decision**: Add a public `openApiObject` getter to `SwaggerUiProvider` in both the v3.1 and v3.2 implementations. This returns the same object reference passed via `options.api.openApiObject`.

**Rationale**: The validation pipe needs access to the fully populated OpenAPI spec. Currently, the only way to share it is for the developer to hold a reference to the same object they pass to `SwaggerUiProvider`. While this works, exposing the object via a getter is cleaner, more discoverable, and follows the principle of least surprise. It also enables patterns like:

```ts
const swaggerProvider = new SwaggerUiProvider({ api: { openApiObject: spec, path: '/docs' } });
swaggerProvider.provide(container);

const pipe = new OpenApiValidationPipe(swaggerProvider.openApiObject, getContentType);
```

### 3. Export metadata utilities from `@inversifyjs/http-open-api` per version

**Decision**: Export `controllerOpenApiMetadataReflectKey`, the `ControllerOpenApiMetadata` type, and a `getControllerOpenApiMetadata(target)` helper function from each version's barrel export (`index.ts` and `v3Dot2.ts`).

**Rationale**: The validation pipe needs to read the `methodToOperationObjectMap` from `ControllerOpenApiMetadata` to resolve the OpenAPI operation for a given controller method. This metadata is stored behind the version-specific reflect key. Without these exports, the validation package would need to duplicate the reflect key strings and metadata types — a fragile coupling.

The `getControllerOpenApiMetadata(target)` helper encapsulates the `getOwnReflectMetadata(target, controllerOpenApiMetadataReflectKey)` call, providing a clean API for consumers.

### 4. `@Validate()` as a version-agnostic opt-in parameter decorator

**Decision**: `@Validate()` is a parameter decorator that stores a marker in reflect metadata using its own dedicated reflect key (following the `@ValidateAjvSchema` pattern). It is shared across versions. The `OpenApiValidationPipe` is registered by the user as a global pipe and checks for this marker before attempting validation.

**Rationale**: The `@Validate()` decorator only stores a boolean marker — it has no knowledge of OpenAPI versions. Making it version-agnostic means developers use the same decorator regardless of which OpenAPI version they work with. The version-specific pipe is responsible for reading and acting on the marker. The decorator cannot add to the parameter's `pipeList` because `@Body()` creates its own metadata that replaces any prior pipeList — this is consistent with how `@ValidateAjvSchema` works by storing metadata in a separate key.

### 5. Use `ajv` directly (not `express-openapi-validator`)

**Decision**: Use `ajv@^8` with `ajv-formats` directly instead of `express-openapi-validator` or other framework-specific validators.

**Rationale**: `express-openapi-validator` is Express-specific, which conflicts with the adapter-agnostic design. Using `ajv` directly provides full control and works identically across all adapters. The PoC confirmed that `ajv.addSchema(openapiDoc, id)` + `ajv.getSchema("id#/paths/.../schema")` resolves `$ref` pointers and compiles schemas correctly for both OpenAPI 3.1 and 3.2 documents.

**Alternatives considered**:
- `express-openapi-validator`: Express-only, immediately rules it out.
- Building a custom schema resolver: unnecessary — ajv handles JSON pointer resolution and `$ref` natively.

### 6. Receive the OpenAPI spec as a constructor parameter

**Decision**: Each version's `OpenApiValidationPipe` accepts the version-appropriate OpenAPI object in its constructor. This is the same object instance the developer passes to `SwaggerUiProvider` (or obtains via `swaggerProvider.openApiObject`).

**Rationale**: `SwaggerUiProvider` mutates the passed-in object in place (populating `paths` and `components.schemas`). By sharing the same reference, the validation pipe sees the fully populated spec after `SwaggerUiProvider.provide()` completes. The pipe initializes `ajv` on first use (lazy), ensuring the spec is fully built by then.

### 7. Resolve content type from the request

**Decision**: The pipe accepts an optional `requestContentTypeProvider` callback (`() => string | undefined`) in its constructor. If the provider is omitted or returns undefined: if the endpoint declares exactly one content type, use it; otherwise throw a validation error.

**Rationale**: This matches the behavior discussed in the issue. OpenAPI operations can declare multiple content types per request body (e.g., `application/json` and `application/xml`), each with potentially different schemas.

The pipe runs as a global pipe (matching the `AjvValidationPipe` pattern). `PipeMetadata` does not include request context — this is by design in the adapter-agnostic framework. The content-type provider callback bridges this gap: the user provides a callback that returns the current request's content-type (e.g., via `AsyncLocalStorage`, framework-specific middleware, or other mechanisms).

For the common case (single content type per endpoint), the provider is unnecessary — the pipe automatically selects the only available schema. The provider is only essential for multi-content-type endpoints.

### 8. Version-specific pipe implementations

**Decision**: Each OpenAPI version has its own `OpenApiValidationPipe` class. The v3.1 pipe imports from `@inversifyjs/http-open-api` (default/v3Dot1) and the v3.2 pipe imports from `@inversifyjs/http-open-api/v3Dot2`.

**Rationale**: Different OpenAPI versions use different reflect metadata keys, different metadata types (different operation object types), and different OpenAPI object types. While the validation logic is structurally identical, the type-level differences and the version-specific imports make separate implementations cleaner than a complex generic approach.

The core algorithm is the same for both:
1. Uses `PipeMetadata` to call `getControllerMethodParameterMetadataList` and check if the parameter is a `Body`. Reads the `@Validate()` marker from its dedicated reflect key.
2. Uses `getControllerMetadataList` to find the controller metadata matching `metadata.targetClass` and get the controller-level path.
3. Uses `getControllerMethodMetadataList` to find the method metadata matching `metadata.methodName` and get the method-level path and HTTP method.
4. Uses the version-specific `getControllerOpenApiMetadata` to read the `ControllerOpenApiMetadata` from the controller, getting the `methodToOperationObjectMap`.
5. Reads `requestBody.content` from the operation object to determine available content types and apply fallback logic.
6. Constructs a JSON pointer into the spec: `schemaId#/paths/{escapedPath}/{method}/requestBody/content/{escapedContentType}/schema`.
7. Calls `ajv.getSchema(pointer)` to get the compiled validator.
8. Validates the input. If it fails, throws `InversifyValidationError` with kind `validationFailed`.

### 9. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

**Decision**: Add a public export of `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`'s barrel.

**Rationale**: The validation pipe needs to inspect the parameter type (`Body`, `Query`, etc.) to decide whether to validate. This is a read-only accessor that is useful beyond just this feature.

### 10. Lazy `ajv` initialization

**Decision**: Initialize the `ajv` instance and compile schemas lazily on first `execute()` call.

**Rationale**: The OpenAPI object is mutated in place by `SwaggerUiProvider.provide()`. The pipe may be instantiated before the spec is fully populated. Lazy init ensures the spec is complete before `ajv.addSchema()` is called.

## Risks / Trade-offs

- **[Risk] OpenAPI spec must be fully built before first validation** → Mitigated by lazy ajv initialization.
- **[Risk] `ajv` adds a peer dependency** → Mitigated by making it a peer dep; users who don't use this feature don't need it.
- **[Risk] Content-type detection for multi-type endpoints may not cover all edge cases** → Mitigated by starting with strict behavior: require explicit content-type when >1 type is declared.
- **[Trade-off] Body-only validation limits initial usefulness** → Acceptable for first iteration; covers the primary use case. Query/header validation is more complex (string-to-type coercion challenges discussed in the issue).
- **[Trade-off] Pipe needs access to request context** → Pipe must be a container-managed service with request-scoped dependencies, or accept a content-type provider.
- **[Trade-off] Two pipe implementations (v3.1 and v3.2) instead of one** → The logic is structurally identical but type parameters differ. This avoids complex generics and aligns with the established convention in `@inversifyjs/http-open-api`. Future refactoring could extract a shared base if warranted.
