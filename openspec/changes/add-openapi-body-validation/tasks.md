## 1. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

- [ ] 1.1 Add `getControllerMethodParameterMetadataList` to the public barrel export in `packages/framework/http/libraries/core/src/index.ts`
- [ ] 1.2 Verify the build succeeds for `@inversifyjs/http-core` (`pnpm run --filter "@inversifyjs/http-core" build`)

## 2. Expose `openApiObject` from `SwaggerUiProvider` (both versions)

- [ ] 2.1 Add a public `get openApiObject()` getter to the v3.1 `SwaggerUiProvider` at `packages/framework/http/libraries/open-api/src/openApi/services/v3Dot1/SwaggerUiProvider.ts` that returns `this.#options.api.openApiObject`
- [ ] 2.2 Add a public `get openApiObject()` getter to the v3.2 `SwaggerUiProvider` at `packages/framework/http/libraries/open-api/src/openApi/services/v3Dot2/SwaggerUiProvider.ts` that returns `this.#options.api.openApiObject`
- [ ] 2.3 Add unit tests for the getter in both versions: returns the object before `provide()`, returns the populated object after `provide()`
- [ ] 2.4 Verify the build succeeds for `@inversifyjs/http-open-api` (`pnpm run --filter "@inversifyjs/http-open-api" build`)

## 3. Export OpenAPI metadata utilities from `@inversifyjs/http-open-api` (both versions)

- [ ] 3.1 Create a `getControllerOpenApiMetadata(target)` helper at `packages/framework/http/libraries/open-api/src/metadata/calculations/v3Dot1/getControllerOpenApiMetadata.ts` that calls `getOwnReflectMetadata(target, controllerOpenApiMetadataReflectKey)` and returns the v3.1 `ControllerOpenApiMetadata | undefined`
- [ ] 3.2 Create the same helper for v3.2 at `packages/framework/http/libraries/open-api/src/metadata/calculations/v3Dot2/getControllerOpenApiMetadata.ts`
- [ ] 3.3 Add `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` to the v3.1 barrel export (`packages/framework/http/libraries/open-api/src/index.ts`)
- [ ] 3.4 Add `controllerOpenApiMetadataReflectKey`, `ControllerOpenApiMetadata` type, and `getControllerOpenApiMetadata` to the v3.2 barrel export (`packages/framework/http/libraries/open-api/src/v3Dot2.ts`)
- [ ] 3.5 Add unit tests for `getControllerOpenApiMetadata` (both versions): returns metadata for a decorated controller, returns `undefined` for an undecorated controller
- [ ] 3.6 Verify the build succeeds (`pnpm run --filter "@inversifyjs/http-open-api" build && pnpm run --filter "@inversifyjs/http-open-api" test`)

## 4. Scaffold `@inversifyjs/http-openapi-validation` package

- [ ] 4.1 Create directory structure at `packages/framework/http/libraries/openapi-validation/` with `src/`, `src/common/`, `src/v3Dot1/`, `src/v3Dot2/`, `package.json`, `tsconfig.json`, `tsconfig.esm.json`, `eslint.config.mjs`, `prettier.config.mjs`, `vitest.config.mjs`
- [ ] 4.2 Configure `package.json` with: dependencies on `@inversifyjs/http-core`, `@inversifyjs/http-open-api`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `@inversifyjs/reflect-metadata-utils`, and `@inversifyjs/prototype-utils`; peer dependencies on `ajv@^8` and `ajv-formats`; standard scripts (build, test, lint, format); subpath exports: `"."` → `./lib/index.js`, `"./v3Dot1"` → `./lib/index.js`, `"./v3Dot2"` → `./lib/v3Dot2.js`
- [ ] 4.3 Run `pnpm install` to link workspace dependencies

## 5. Validate decorator (shared, version-agnostic)

- [ ] 5.1 Create the `openApiValidationMetadataReflectKey` constant at `src/common/reflectMetadata/openApiValidationMetadataReflectKey.ts`
- [ ] 5.2 Implement the `@Validate()` parameter decorator at `src/common/decorators/Validate.ts` that stores a boolean marker in reflect metadata (using its own dedicated reflect key, following the `@ValidateAjvSchema` pattern)
- [ ] 5.3 Add unit tests for `@Validate()`: marker is stored in the dedicated reflect key for decorated parameter, marker is absent for undecorated parameter

## 6. OpenApiValidationPipe v3.1 implementation

- [ ] 6.1 Implement `OpenApiValidationPipe` class at `src/v3Dot1/pipes/OpenApiValidationPipe.ts` implementing `Pipe` with constructor accepting `OpenApi3Dot1Object` and a content-type provider
- [ ] 6.2 Implement lazy ajv initialization: on first `execute()`, create `Ajv({ strict: false, allErrors: true })`, call `addFormats(ajv)`, call `ajv.addSchema(openapiDoc, schemaId)`
- [ ] 6.3 Implement parameter-type check: use `getControllerMethodParameterMetadataList` to verify the parameter is a body and has the `@Validate()` marker; return input unchanged otherwise
- [ ] 6.4 Implement route resolution: use `getControllerOpenApiMetadata` (v3.1) to read the operation object from `methodToOperationObjectMap`, and use controller/method metadata from `@inversifyjs/http-core` to construct the OpenAPI path and method
- [ ] 6.5 Implement content-type resolution: read content type from the request body's `content` map in the operation object; apply fallback and error rules per spec
- [ ] 6.6 Implement JSON pointer construction and schema lookup: encode the path and content type into a JSON pointer, call `ajv.getSchema(pointer)` to get the compiled validator
- [ ] 6.7 Implement validation execution: run the compiled validator against the input; if it fails, throw `InversifyValidationError` with kind `validationFailed` and error details
- [ ] 6.8 Add unit tests for v3.1 `OpenApiValidationPipe`: valid body passes, invalid body fails, non-body parameter skipped, missing Validate marker skipped, lazy init only once, content-type resolution (all four scenarios), format validation works, unsupported content-type errors

## 7. OpenApiValidationPipe v3.2 implementation

- [ ] 7.1 Implement `OpenApiValidationPipe` class at `src/v3Dot2/pipes/OpenApiValidationPipe.ts` implementing `Pipe` with constructor accepting `OpenApi3Dot2Object` and a content-type provider (mirrors v3.1 implementation with v3.2 types and imports)
- [ ] 7.2 Add unit tests for v3.2 `OpenApiValidationPipe` (mirrors v3.1 tests with v3.2 types)

## 8. Package barrel exports

- [ ] 8.1 Create `src/index.ts` exporting `Validate` (from common) and `OpenApiValidationPipe` (from v3.1)
- [ ] 8.2 Create `src/v3Dot2.ts` exporting `Validate` (from common) and `OpenApiValidationPipe` (from v3.2)
- [ ] 8.3 Verify the package builds successfully (`pnpm run --filter "@inversifyjs/http-openapi-validation" build`)

## 9. Integration testing

- [ ] 9.1 Write an integration test (v3.1) demonstrating end-to-end body validation: a controller with `@OasRequestBody` + `@Body()` + `@Validate()`, an OpenAPI spec populated by `SwaggerUiProvider`, and the `OpenApiValidationPipe` validating valid and invalid request bodies
- [ ] 9.2 Write an integration test (v3.2) mirroring the v3.1 test with v3.2 decorators, types, and imports
- [ ] 9.3 Write an integration test covering content-type fallback (single content type, no header)
- [ ] 9.4 Write an integration test covering content-type ambiguity error (multiple content types, no header)

## 10. Verification

- [ ] 10.1 Run the full test suite for the new package (`pnpm run --filter "@inversifyjs/http-openapi-validation" test`)
- [ ] 10.2 Run linter and formatter (`pnpm run --filter "@inversifyjs/http-openapi-validation" lint && pnpm run --filter "@inversifyjs/http-openapi-validation" format`)
- [ ] 10.3 Verify `@inversifyjs/http-core` build and tests still pass (`pnpm run --filter "@inversifyjs/http-core" build && pnpm run --filter "@inversifyjs/http-core" test`)
- [ ] 10.4 Verify `@inversifyjs/http-open-api` build and tests still pass (`pnpm run --filter "@inversifyjs/http-open-api" build && pnpm run --filter "@inversifyjs/http-open-api" test`)
- [ ] 10.5 Verify the full build succeeds (`pnpm run build`)
