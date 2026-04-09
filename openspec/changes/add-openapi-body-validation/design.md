## Context

The `@inversifyjs/http-open-api` package lets developers annotate controllers with OpenAPI decorators (`@OasRequestBody`, `@OasSchema`, etc.). The package supports **multiple OpenAPI versions** via subpath exports: `@inversifyjs/http-open-api` (default, v3.1), `@inversifyjs/http-open-api/v3Dot1`, and `@inversifyjs/http-open-api/v3Dot2`. Each version has its own `SwaggerUiProvider`, reflect metadata keys, and type definitions. The `SwaggerUiProvider` collects OAS metadata and populates the version-appropriate OpenAPI object (`OpenApi3Dot1Object` or `OpenApi3Dot2Object`) at runtime, including `paths` and `components.schemas`.

Key architectural facts:
- **Reflect metadata keys are version-separated**: v3.1 and v3.2 use different keys, preventing metadata collisions.
- **`SwaggerUiProvider`** is version-specific but has identical logic — only the OpenAPI types differ.
- **The OpenAPI object** is passed via constructor options and mutated in-place during `provide()`. A public `openApiObject` getter exposes the reference.
- **`controllerOpenApiMetadataReflectKey` and `ControllerOpenApiMetadata`** are publicly exported from `@inversifyjs/http-open-api` per version subpath.

The framework's pipe system (`Pipe.execute(input, metadata)`) is adapter-agnostic and provides `PipeMetadata` containing `targetClass`, `methodName`, and `parameterIndex`. Pipes can be registered globally. **Critically, `PipeMetadata` does not include request context** (no headers, URL, method, etc.) — this is by design in the adapter-agnostic framework.

The `@Body()` decorator and other standard parameter decorators only extract a single value from the request. For body validation, however, the pipe needs the body **plus** the HTTP method, URL path, and content-type header to resolve the correct OpenAPI schema. This means a standard `@Body()` + marker approach is insufficient — the pipe would lack the request context needed for schema resolution.

`@inversifyjs/http-core` provides `createCustomParameterDecorator`, which allows creating parameter decorators with a handler that receives the full request, response, and an options object with helper methods (`getHeaders`, `getBody`, `getMethod`, `getUrl`). This is the mechanism used to extract all required request context.

`getControllerMethodParameterMetadataList` is exported from `@inversifyjs/http-core` to allow inspecting parameter types.

A PoC validated that `ajv` (with `ajv-formats`) can load an entire OpenAPI 3.1/3.2 document via `addSchema(openapiDoc, id)` and compile individual request body schemas using JSON pointers like `ajv.getSchema("id#/paths/~1users/post/requestBody/content/application~1json/schema")`, resolving `$ref` references automatically.

## Goals / Non-Goals

**Goals:**
- Enable body validation using existing OpenAPI metadata as the single source of truth.
- Support both OpenAPI 3.1 and OpenAPI 3.2 via version-specific validation pipes.
- Expose the OpenAPI object from `SwaggerUiProvider` so consumers can access the fully populated spec.
- Provide metadata utility exports from `@inversifyjs/http-open-api` per version.
- Provide an explicit opt-in `@ValidatedBody()` custom parameter decorator that both extracts the body and marks it for validation, gathering all request context needed for schema resolution.
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

**Decision**: Create a new package at `packages/framework/http/libraries/openapi-validation/` with subpath exports: `"."` exports the shared `ValidatedBody` decorator, `"./v3Dot1"` exports the v3.1 `OpenApiValidationPipe`, and `"./v3Dot2"` exports the v3.2 `OpenApiValidationPipe`.

**Rationale**: The feature bridges `http-core` (pipe system, parameter metadata, custom parameter decorators) and `open-api` (OpenAPI spec, schema generation). Placing it in a separate package avoids coupling the core HTTP layer to ajv or OpenAPI concerns.

The `ValidatedBody` decorator is shared (version-agnostic) since it only stores a marker and extracts request context — it has no knowledge of OpenAPI versions. The `OpenApiValidationPipe` is version-specific because it needs version-specific OpenAPI types.

**Package structure:**
```
src/
  index.ts           # exports ValidatedBody
  v3Dot1.ts          # exports OpenApiValidationPipe for v3.1
  v3Dot2.ts          # exports OpenApiValidationPipe for v3.2
  metadata/
    decorators/
      ValidatedBody.ts    # Custom parameter decorator (version-agnostic)
    actions/
      setValidateMetadata.ts  # Stores validation marker
    models/
      openApiValidationMetadataReflectKey.ts
  validation/
    calculations/
      buildCompositeValidationHandler.ts
      getMimeType.ts
      getPath.ts
      v3Dot1/
        getOperationObject.ts
        getPathItemObject.ts
        getRequestBodyObject.ts
        handleBodyValidation.ts
        inferContentType.ts
      v3Dot2/
        ...  # mirrors v3Dot1
    models/
      BodyValidationInputParam.ts
      ValidationHandler.ts
      DiscriminatorValidationHandlerPair.ts
      validatedInputParamTypes.ts
      ValidatedDecoratorResult.ts
      v3Dot1/schemaId.ts
      v3Dot2/schemaId.ts
    pipes/
      v3Dot1/OpenApiValidationPipe.ts
      v3Dot2/OpenApiValidationPipe.ts
```

**Alternatives considered**:
- Adding to `@inversifyjs/http-open-api`: rejected because validation is a distinct concern from spec generation / Swagger UI.
- Adding to `@inversifyjs/http-validation`: rejected because that package is framework-agnostic (works with any validation source), whereas this is specifically OpenAPI-driven.

### 2. Expose the OpenAPI object from `SwaggerUiProvider`

**Decision**: Add a public `openApiObject` getter to `SwaggerUiProvider` in both the v3.1 and v3.2 implementations. This returns the same object reference passed via `options.api.openApiObject`.

**Rationale**: The validation pipe needs access to the fully populated OpenAPI spec. Exposing the object via a getter is clean, discoverable, and enables patterns like:

```ts
const swaggerProvider = new SwaggerUiProvider({ api: { openApiObject: spec, path: '/docs' } });
swaggerProvider.provide(container);

const pipe = new OpenApiValidationPipe(swaggerProvider.openApiObject);
```

### 3. Export metadata utilities from `@inversifyjs/http-open-api` per version

**Decision**: Export `controllerOpenApiMetadataReflectKey`, the `ControllerOpenApiMetadata` type, and a `getControllerOpenApiMetadata(target)` helper function from each version's barrel export.

**Rationale**: Without these exports, the validation package would need to duplicate the reflect key strings and metadata types — a fragile coupling. The `getControllerOpenApiMetadata(target)` helper provides a clean API for consumers.

### 4. `@ValidatedBody()` as a custom parameter decorator instead of `@Validate()` + `@Body()`

**Decision**: Instead of the originally planned `@Validate()` marker used alongside `@Body()`, the implementation uses a single `@ValidatedBody()` custom parameter decorator built with `createCustomParameterDecorator`. This decorator:
1. Calls `setValidateMetadata` to store the validation marker in reflect metadata.
2. Uses `createCustomParameterDecorator` with a handler that extracts from the request: the body, HTTP method, URL, and Content-Type header.
3. Returns a `BodyValidationInputParam` object containing all extracted data.

**Rationale**: The original `@Validate()` + `@Body()` design had a fundamental problem: the pipe receives only the extracted body value from `@Body()`, but needs additional request context (HTTP method, URL path, Content-Type header) to resolve the correct OpenAPI schema via JSON pointer. `PipeMetadata` does not include request context by design.

Using `createCustomParameterDecorator` solves this by giving the decorator handler access to the full request via `options.getHeaders()`, `options.getBody()`, `options.getMethod()`, and `options.getUrl()`. The decorator packages all necessary context into a `BodyValidationInputParam` object that the pipe can use for schema resolution.

The pipe uses a discriminator-based dispatch: the input's `type` field (a unique symbol `validatedInputParamBodyType`) tells `buildCompositeValidationHandler` which validation handler to invoke. This design is extensible — future validated parameter types (query, headers) can add their own symbols and handlers.

**Alternatives considered**:
- `@Validate()` + `@Body()` with `requestContentTypeProvider` callback: rejected because it still doesn't provide URL/method to the pipe; also requires users to wire up `AsyncLocalStorage` or similar for content-type, which is complex and error-prone.
- Making the pipe request-scoped: rejected because it would require DI container integration and adapter-specific request context, breaking the adapter-agnostic design.

### 5. Use `ajv` directly (not `express-openapi-validator`)

**Decision**: Use `ajv@^8` with `ajv-formats` directly instead of framework-specific validators.

**Rationale**: `express-openapi-validator` is Express-specific, conflicting with the adapter-agnostic design. The PoC confirmed `ajv.addSchema(openapiDoc, id)` + `ajv.getSchema("id#/paths/.../schema")` resolves `$ref` pointers and compiles schemas correctly for both OpenAPI 3.1 and 3.2.

### 6. Receive the OpenAPI spec as a constructor parameter

**Decision**: Each version's `OpenApiValidationPipe` accepts only the version-appropriate OpenAPI object in its constructor (no content-type provider callback needed).

**Rationale**: Since `@ValidatedBody()` extracts the Content-Type header directly from the request, the pipe no longer needs an external content-type provider. The constructor is simplified to a single parameter. `SwaggerUiProvider` mutates the passed-in object in place, so sharing the same reference ensures the pipe sees the fully populated spec.

### 7. Content-type resolution from the request

**Decision**: The `@ValidatedBody()` decorator extracts the `Content-Type` header from the request and passes it as part of `BodyValidationInputParam`. The pipe uses this content type directly. If absent and the endpoint declares exactly one content type, the pipe uses it; otherwise it throws a validation error.

**Rationale**: Extracting content type in the decorator handler (via `options.getHeaders(request, 'content-type')`) is clean and adapter-agnostic. The MIME type is parsed from the header value (stripping parameters like `charset=utf-8`) via the `getMimeType` utility. This eliminates the need for `AsyncLocalStorage`, middleware, or callback-based providers.

### 8. Version-specific pipe implementations

**Decision**: Each OpenAPI version has its own `OpenApiValidationPipe` class using version-specific OpenAPI types.

**Rationale**: Different OpenAPI versions use different OpenAPI object types. While the validation logic is structurally identical, the type-level differences make separate implementations cleaner than complex generics.

The core algorithm for both:
1. Awaits the input (to handle async custom decorators).
2. Uses `getControllerMethodParameterMetadataList` to retrieve parameter metadata.
3. Checks the `@ValidatedBody()` marker from the dedicated reflect key; skips if absent.
4. Checks if input is a non-null object; skips otherwise.
5. Lazily initializes Ajv and loads the full OpenAPI spec.
6. Delegates to `buildCompositeValidationHandler` which dispatches based on the input's `type` discriminator to `handleBodyValidation`.
7. `handleBodyValidation` extracts path/method/contentType from the input, resolves the OpenAPI operation and request body, constructs the JSON pointer, validates with Ajv, and throws `InversifyValidationError` on failure.

### 9. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

**Decision**: Add a public export of `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`'s barrel.

**Rationale**: The validation pipe needs to inspect parameter metadata to decide whether the validate marker is present. This is a read-only accessor useful beyond just this feature.

### 10. Lazy `ajv` initialization

**Decision**: Initialize the `ajv` instance and compile schemas lazily on first `execute()` call.

**Rationale**: The OpenAPI object is mutated in place by `SwaggerUiProvider.provide()`. The pipe may be instantiated before the spec is fully populated. Lazy init ensures the spec is complete before `ajv.addSchema()` is called.

## Risks / Trade-offs

- **[Risk] OpenAPI spec must be fully built before first validation** → Mitigated by lazy ajv initialization.
- **[Risk] `ajv` adds a peer dependency** → Mitigated by making it a peer dep; users who don't use this feature don't need it.
- **[Risk] Content-type detection for multi-type endpoints may not cover all edge cases** → Mitigated by starting with strict behavior: require explicit content-type when >1 type is declared.
- **[Trade-off] Body-only validation limits initial usefulness** → Acceptable for first iteration; covers the primary use case. Query/header validation is more complex (string-to-type coercion challenges discussed in the issue).
- **[Trade-off] `@ValidatedBody()` replaces `@Body()` rather than augmenting it** → Users must swap `@Body()` for `@ValidatedBody()` on validated parameters. This is a deliberate trade-off: combining body extraction and validation marking into one decorator ensures the pipe receives all required request context. Non-validated body parameters continue using `@Body()` as before.
- **[Trade-off] Two pipe implementations (v3.1 and v3.2) instead of one** → The logic is structurally identical but type parameters differ. This avoids complex generics and aligns with the established convention in `@inversifyjs/http-open-api`.
