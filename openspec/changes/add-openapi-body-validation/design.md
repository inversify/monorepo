## Context

The `@inversifyjs/http-open-api` package lets developers annotate controllers with OpenAPI decorators (`@OasRequestBody`, `@OasSchema`, etc.). The `SwaggerUiProvider` collects this metadata and populates an `OpenApi3Dot1Object` at runtime, including `paths` and `components.schemas`. Separately, validation packages (`@inversifyjs/ajv-validation`, `@inversifyjs/standard-schema-validation`) require developers to redefine schemas for runtime validation, leading to duplication.

The framework's pipe system (`Pipe.execute(input, metadata)`) is adapter-agnostic and provides `PipeMetadata` containing `targetClass`, `methodName`, and `parameterIndex`. Global pipes are applied to every parameter of every handler. The `@Body()` decorator sets `parameterType: RequestMethodParameterType.Body` in the controller method's parameter metadata.

Currently, `getControllerMethodParameterMetadataList` (which retrieves per-parameter metadata from the controller constructor) is internal to `@inversifyjs/http-core` and not exported.

A PoC has validated that `ajv` (with `ajv-formats`) can load an entire OpenAPI 3.1 document via `addSchema(openapiDoc, id)` and then compile individual request body schemas using JSON pointers like `ajv.getSchema("id#/paths/~1users/post/requestBody/content/application~1json/schema")`. This resolves `$ref` references automatically.

## Goals / Non-Goals

**Goals:**
- Enable body validation using existing OpenAPI metadata as the single source of truth.
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

### 1. New package: `@inversifyjs/http-openapi-validation`

**Decision**: Create a new package at `packages/framework/http/libraries/openapi-validation/`.

**Rationale**: The feature bridges `http-core` (pipe system, parameter metadata) and `open-api` (OpenAPI spec, schema generation). Placing it in a separate package avoids coupling the core HTTP layer to ajv or OpenAPI concerns. It follows the existing pattern where `@inversifyjs/http-validation` provides HTTP-specific validation utilities without being part of `http-core`.

**Alternatives considered**:
- Adding to `@inversifyjs/http-open-api`: rejected because validation is a distinct concern from spec generation / Swagger UI.
- Adding to `@inversifyjs/http-validation`: rejected because that package is framework-agnostic (works with any validation source), whereas this is specifically OpenAPI-driven.

### 2. `@Validate()` as an opt-in parameter decorator

**Decision**: `@Validate()` is a parameter decorator that stores a marker in reflect metadata. The `OpenApiValidationPipe` checks for this marker before attempting validation.

**Rationale**: As discussed in the issue, making validation explicit avoids surprises with edge cases (e.g., `@Request()` parameters) and allows developers to disable validation for specific endpoints without removing OpenAPI documentation. The decorator itself is intentionally simple — it just sets metadata.

### 3. Use `ajv` directly (not `express-openapi-validator`)

**Decision**: Use `ajv@^8` with `ajv-formats` directly instead of `express-openapi-validator` or other framework-specific validators.

**Rationale**: `express-openapi-validator` is Express-specific, which conflicts with the adapter-agnostic design. Using `ajv` directly provides full control and works identically across all adapters. The PoC confirmed that `ajv.addSchema(openapiDoc, id)` + `ajv.getSchema("id#/paths/.../schema")` resolves `$ref` pointers and compiles schemas correctly.

**Alternatives considered**:
- `express-openapi-validator`: Express-only, immediately rules it out.
- Building a custom schema resolver: unnecessary — ajv handles JSON pointer resolution and `$ref` natively.

### 4. Receive the OpenAPI spec as a constructor parameter

**Decision**: `OpenApiValidationPipe` accepts the `OpenApi3Dot1Object` in its constructor. This is the same object instance the developer passes to `SwaggerUiProvider`.

**Rationale**: `SwaggerUiProvider` mutates the passed-in object in place (populating `paths` and `components.schemas`). By sharing the same reference, the validation pipe sees the fully populated spec after `SwaggerUiProvider.provide()` completes. The pipe initializes `ajv` on first use (lazy), ensuring the spec is fully built by then.

### 5. Resolve content type from the request

**Decision**: The pipe reads the `Content-Type` header from `PipeMetadata` (extended or via a request accessor). If no header is present: if the endpoint declares exactly one content type, use it; otherwise throw a validation error.

**Rationale**: This matches the behavior discussed in the issue. OpenAPI operations can declare multiple content types per request body (e.g., `application/json` and `application/xml`), each with potentially different schemas.

**Implementation detail:** The pipe needs the HTTP request's `Content-Type` header, but `PipeMetadata` only provides `targetClass`, `methodName`, and `parameterIndex`. The pipe will use `getControllerMethodParameterMetadataList` to verify the parameter is a body. Content-type resolution requires a request accessor — the pipe will accept a `getContentType: () => string | undefined` function (provided through middleware or constructor). The simplest approach: make `OpenApiValidationPipe` a class that receives a `getContentType` callback or the OpenAPI path/method context at construction time. Since global pipes are singletons but the content type varies per request, the pipe needs **per-request context**. The solution: the `@Validate()` decorator stores the OpenAPI path and method (inferred from the controller's `@Post('/')` etc. metadata) and the pipe uses route metadata to find the right schema. Content type comes from the request headers already parsed by the framework.

**Revised approach**: `OpenApiValidationPipe` cannot be a simple global pipe because it needs per-request context (path, method, content-type). Instead, it is used as a **per-parameter pipe** applied by the `@Validate()` decorator:

```ts
@Post('/')
createUser(@Body() @Validate() userData: CreateUserRequest) { ... }
```

This attaches the pipe to the body parameter's `pipeList`. The pipe's `execute(input, metadata)` method uses `metadata.targetClass` and `metadata.methodName` to discover OAS route info from the controller's method metadata, and reads the `Content-Type` from request headers. Since the pipe needs runtime access to the request, it can be registered as a service identifier and resolved from the container, allowing injection of a request-scoped content-type accessor.

**Simpler revised approach**: `OpenApiValidationPipe` is still a **global pipe** (registered via `adapter.useGlobalPipe(...)`). It:
1. Uses `metadata.targetClass` + `metadata.methodName` + `metadata.parameterIndex` to call `getControllerMethodParameterMetadataList` and check if the parameter is a `Body`.
2. Checks if the `@Validate()` marker is present for that parameter.
3. Reads controller method metadata to determine the HTTP method and path pattern.
4. Constructs the JSON pointer for the request body schema.
5. The content-type is not available in `PipeMetadata` — **but the body has already been parsed by the framework before the pipe runs**. The pipe needs the raw content-type to select the right schema. This is obtainable from the `@Validate()` decorator metadata or from the request object itself.

**Final approach**: The `@Validate()` decorator adds the `OpenApiValidationPipe` to the parameter's `pipeList` (same pattern as `@ValidateAjvSchema`). The pipe is instantiated once and shared. It uses `PipeMetadata` to look up the controller's route metadata. For the content-type, the pipe needs the request to be available — this is achieved by the pipe being a service that gets the request from a request-scoped binding or by accepting a `getContentType` factory in the constructor. The simplest working approach: the user passes a `getContentType` function that reads from the request.

**Actual simplest approach (final)**: The `OpenApiValidationPipe` constructor receives the OpenAPI spec object and the OpenAPI path/method mapping is derived from controller metadata at runtime. Since the pipe runs per-parameter and needs the content-type, the pipe accepts a `requestContentTypeProvider` callback. In practice, for the first iteration, the decorator `@Validate()` will add the pipe instance to the parameter's pipe list. The pipe uses `PipeMetadata` to figure out the method/path via controller metadata. For content-type, the pipe will look up the available content types from the spec and follow the rules described in the proposal. The content-type itself must be provided — either through constructor injection (request-scoped) or by the `@Validate()` decorator storing it. Given the framework's architecture, the cleanest pattern is: `OpenApiValidationPipe` is a container-managed service (resolvable via `ServiceIdentifier`). The `@Validate()` decorator pushes the service identifier into the pipe list. The pipe is resolved per-request from the container, which can provide request-scoped bindings for the content type.

### 6. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

**Decision**: Add a public export of `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`'s barrel.

**Rationale**: The validation pipe needs to inspect the parameter type (`Body`, `Query`, etc.) to decide whether to validate. This is a read-only accessor that is useful beyond just this feature.

### 7. Lazy `ajv` initialization

**Decision**: Initialize the `ajv` instance and compile schemas lazily on first `execute()` call.

**Rationale**: The `OpenApi3Dot1Object` is mutated in place by `SwaggerUiProvider.provide()`. The pipe may be instantiated before the spec is fully populated. Lazy init ensures the spec is complete before `ajv.addSchema()` is called.

## Risks / Trade-offs

- **[Risk] OpenAPI spec must be fully built before first validation** → Mitigated by lazy ajv initialization.
- **[Risk] `ajv` adds a peer dependency** → Mitigated by making it a peer dep; users who don't use this feature don't need it.
- **[Risk] Content-type detection for multi-type endpoints may not cover all edge cases** → Mitigated by starting with strict behavior: require explicit content-type when >1 type is declared.
- **[Trade-off] Body-only validation limits initial usefulness** → Acceptable for first iteration; covers the primary use case. Query/header validation is more complex (string-to-type coercion challenges discussed in the issue).
- **[Trade-off] Pipe needs access to request context** → Pipe must be a container-managed service with request-scoped dependencies, or accept a content-type provider.
