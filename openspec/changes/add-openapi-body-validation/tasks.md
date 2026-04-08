## 1. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

- [x] 1.1 Add `getControllerMethodParameterMetadataList` to the public barrel export in `packages/framework/http/libraries/core/src/index.ts`
- [x] 1.2 Verify the build succeeds for `@inversifyjs/http-core` (`pnpm run --filter "@inversifyjs/http-core" build`)

## 2. Expose `openApiObject` from `SwaggerUiProvider` (both versions)

- [x] 2.1 Add a public `get openApiObject()` getter to the v3.1 `SwaggerUiProvider` at `packages/framework/http/libraries/open-api/src/openApi/services/v3Dot1/SwaggerUiProvider.ts` that returns `this.#options.api.openApiObject`
- [x] 2.2 Add a public `get openApiObject()` getter to the v3.2 `SwaggerUiProvider` at `packages/framework/http/libraries/open-api/src/openApi/services/v3Dot2/SwaggerUiProvider.ts` that returns `this.#options.api.openApiObject`
- [x] 2.3 Add unit tests for the getter in both versions
- [x] 2.4 Verify the build succeeds for `@inversifyjs/http-open-api` (`pnpm run --filter "@inversifyjs/http-open-api" build`)

## 3. Export OpenAPI metadata utilities from `@inversifyjs/http-open-api` (both versions)

- [x] 3.1 Create a `getControllerOpenApiMetadata(target)` helper for v3.1
- [x] 3.2 Create the same helper for v3.2
- [x] 3.3 Add `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` to the v3.1 barrel export
- [x] 3.4 Add `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` to the v3.2 barrel export
- [x] 3.5 Add unit tests for `getControllerOpenApiMetadata` (both versions)
- [x] 3.6 Verify the build succeeds (`pnpm run --filter "@inversifyjs/http-open-api" build && pnpm run --filter "@inversifyjs/http-open-api" test`)

## 4. Scaffold `@inversifyjs/http-openapi-validation` package

- [x] 4.1 Create directory structure at `packages/framework/http/libraries/openapi-validation/` with `src/`, `src/metadata/`, `src/validation/`, `package.json`, `tsconfig.json`, `tsconfig.esm.json`, `eslint.config.mjs`, `prettier.config.mjs`, `vitest.config.mjs`
- [x] 4.2 Configure `package.json` with: dependencies on `@inversifyjs/http-core`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `@inversifyjs/reflect-metadata-utils`, `@inversifyjs/json-schema-pointer`, `@inversifyjs/json-schema-types`, `@inversifyjs/open-api-types`; peer dependencies on `ajv@^8` and `ajv-formats`; standard scripts (build, test, lint, format); subpath exports: `"."` → `./lib/index.js`, `"./v3Dot1"` → `./lib/v3Dot1.js`, `"./v3Dot2"` → `./lib/v3Dot2.js`
- [x] 4.3 Run `pnpm install` to link workspace dependencies

## 5. `@ValidatedBody()` custom parameter decorator (shared, version-agnostic)

- [x] 5.1 Create the `openApiValidationMetadataReflectKey` constant at `src/metadata/models/openApiValidationMetadataReflectKey.ts`
- [x] 5.2 Implement `setValidateMetadata` action at `src/metadata/actions/setValidateMetadata.ts` that stores a boolean marker in reflect metadata at the parameter index
- [x] 5.3 Implement the `@ValidatedBody()` custom parameter decorator at `src/metadata/decorators/ValidatedBody.ts` that:
  - Calls `setValidateMetadata` to store the validation marker
  - Uses `createCustomParameterDecorator` with a handler that extracts: body (via `options.getBody`), HTTP method (via `options.getMethod`), URL (via `options.getUrl`), and Content-Type header (via `options.getHeaders`) parsed through `getMimeType`
  - Returns a `BodyValidationInputParam` object with a `type` discriminator symbol (`validatedInputParamBodyType`)
- [x] 5.4 Create `BodyValidationInputParam` interface at `src/validation/models/BodyValidationInputParam.ts`
- [x] 5.5 Create `validatedInputParamBodyType` unique symbol at `src/validation/models/validatedInputParamTypes.ts`
- [x] 5.6 Add unit tests for `setValidateMetadata`: marker is stored at the correct parameter index
- [x] 5.7 Add unit tests for `ValidatedBody`: verifies `setValidateMetadata` is called and `createCustomParameterDecorator` is called with the appropriate handler

## 6. Validation calculation modules

- [x] 6.1 Implement `getMimeType` utility at `src/validation/calculations/getMimeType.ts` to extract the base MIME type from a Content-Type header value
- [x] 6.2 Implement `getPath` utility at `src/validation/calculations/getPath.ts` to extract the path from a URL (stripping query parameters)
- [x] 6.3 Implement `buildCompositeValidationHandler` at `src/validation/calculations/buildCompositeValidationHandler.ts` for discriminator-based dispatch using the input's `type` field
- [x] 6.4 Implement v3.1 calculation modules: `getPathItemObject`, `getOperationObject`, `getRequestBodyObject`, `handleBodyValidation`, `inferContentType`
- [x] 6.5 Implement v3.2 calculation modules (mirrors v3.1 with v3.2 types)
- [x] 6.6 Add unit tests for all shared calculation modules (`getMimeType`, `getPath`, `buildCompositeValidationHandler`)
- [x] 6.7 Add unit tests for all v3.1 calculation modules
- [x] 6.8 Add unit tests for all v3.2 calculation modules

## 7. OpenApiValidationPipe v3.1 implementation

- [x] 7.1 Implement `OpenApiValidationPipe` class at `src/validation/pipes/v3Dot1/OpenApiValidationPipe.ts` implementing `Pipe` with constructor accepting only `OpenApi3Dot1Object`
- [x] 7.2 Implement lazy ajv initialization: on first `execute()`, create `Ajv({ strict: false, allErrors: true })`, call `addFormats(ajv)`, call `ajv.addSchema(openapiDoc, schemaId)`
- [x] 7.3 Implement parameter check: use `getControllerMethodParameterMetadataList` to retrieve parameter metadata; check the `@ValidatedBody()` marker from the dedicated reflect key; skip if absent
- [x] 7.4 Implement null/non-object input check: return input unchanged if not a non-null object
- [x] 7.5 Delegate to `buildCompositeValidationHandler` with `[validatedInputParamBodyType, handleBodyValidation]` for discriminator-based dispatch

## 8. OpenApiValidationPipe v3.2 implementation

- [x] 8.1 Implement `OpenApiValidationPipe` class at `src/validation/pipes/v3Dot2/OpenApiValidationPipe.ts` implementing `Pipe` with constructor accepting only `OpenApi3Dot2Object` (mirrors v3.1 with v3.2 types and imports)

## 9. Package barrel exports

- [x] 9.1 Create `src/index.ts` exporting `ValidatedBody` (from metadata/decorators)
- [x] 9.2 Create `src/v3Dot1.ts` exporting `OpenApiValidationPipe` (from v3.1 pipe)
- [x] 9.3 Create `src/v3Dot2.ts` exporting `OpenApiValidationPipe` (from v3.2 pipe)
- [x] 9.4 Verify the package builds successfully (`pnpm run --filter "@inversifyjs/http-openapi-validation" build`)

## 10. Integration testing

- [x] 10.1 Write an integration test (v3.1) demonstrating end-to-end body validation: a controller with `@OasRequestBody` + `@ValidatedBody()`, an OpenAPI spec populated by `SwaggerUiProvider`, and the `OpenApiValidationPipe` validating valid and invalid request bodies
- [x] 10.2 Write an integration test (v3.2) mirroring the v3.1 test with v3.2 decorators, types, and imports

## 11. Verification

- [x] 11.1 Run the full test suite for the new package (`pnpm run --filter "@inversifyjs/http-openapi-validation" test`)
- [x] 11.2 Run linter and formatter (`pnpm run --filter "@inversifyjs/http-openapi-validation" lint && pnpm run --filter "@inversifyjs/http-openapi-validation" format`)
- [x] 11.3 Verify `@inversifyjs/http-core` build and tests still pass
- [x] 11.4 Verify `@inversifyjs/http-open-api` build and tests still pass
- [x] 11.5 Verify the full build succeeds (`pnpm run build`)
