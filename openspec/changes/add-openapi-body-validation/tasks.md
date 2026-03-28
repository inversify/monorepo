## 1. Export `getControllerMethodParameterMetadataList` from `@inversifyjs/http-core`

- [ ] 1.1 Add `getControllerMethodParameterMetadataList` to the public barrel export in `packages/framework/http/libraries/core/src/index.ts`
- [ ] 1.2 Verify the build succeeds for `@inversifyjs/http-core` (`pnpm run --filter "@inversifyjs/http-core" build`)

## 2. Scaffold `@inversifyjs/http-openapi-validation` package

- [ ] 2.1 Create directory structure at `packages/framework/http/libraries/openapi-validation/` with `src/`, `package.json`, `tsconfig.json`, `tsconfig.esm.json`, `eslint.config.mjs`, `prettier.config.mjs`, `vitest.config.mjs`
- [ ] 2.2 Configure `package.json` with dependencies on `@inversifyjs/http-core`, `@inversifyjs/framework-core`, `@inversifyjs/validation-common`, `@inversifyjs/reflect-metadata-utils`, and `@inversifyjs/prototype-utils`; peer dependencies on `ajv@^8` and `ajv-formats`; standard scripts (build, test, lint, format)
- [ ] 2.3 Run `pnpm install` to link workspace dependencies

## 3. Validate decorator

- [ ] 3.1 Create the `openApiValidationMetadataReflectKey` constant for storing the `@Validate()` marker metadata
- [ ] 3.2 Implement the `@Validate()` parameter decorator that stores a boolean marker in reflect metadata and adds the `OpenApiValidationPipe` service identifier to the parameter's pipe list
- [ ] 3.3 Add unit tests for `@Validate()`: marker is stored, pipe is added to pipe list

## 4. OpenApiValidationPipe core implementation

- [ ] 4.1 Implement `OpenApiValidationPipe` class implementing `Pipe` with constructor accepting `OpenApi3Dot1Object` and a content-type provider
- [ ] 4.2 Implement lazy ajv initialization: on first `execute()`, create `Ajv({ strict: false, allErrors: true })`, call `addFormats(ajv)`, call `ajv.addSchema(openapiDoc, schemaId)`
- [ ] 4.3 Implement parameter-type check: use `getControllerMethodParameterMetadataList` to verify the parameter is a body and has the `@Validate()` marker; return input unchanged otherwise
- [ ] 4.4 Implement route resolution: read controller class-level path and method-level path/HTTP method from controller metadata to construct the OpenAPI path and method
- [ ] 4.5 Implement content-type resolution: read content type from provider; if absent and one content type declared, use it; if absent and multiple, throw `InversifyValidationError`; if present and not matching, throw `InversifyValidationError`
- [ ] 4.6 Implement JSON pointer construction and schema lookup: encode the path and content type into a JSON pointer, call `ajv.getSchema(pointer)` to get the compiled validator
- [ ] 4.7 Implement validation execution: run the compiled validator against the input; if it fails, throw `InversifyValidationError` with kind `validationFailed` and error details
- [ ] 4.8 Add unit tests for `OpenApiValidationPipe`: valid body passes, invalid body fails, non-body parameter skipped, missing Validate marker skipped, lazy init only once, content-type resolution (all four scenarios), format validation works, unsupported content-type errors

## 5. Package barrel export

- [ ] 5.1 Create `src/index.ts` exporting `Validate` and `OpenApiValidationPipe`
- [ ] 5.2 Verify the package builds successfully (`pnpm run --filter "@inversifyjs/http-openapi-validation" build`)

## 6. Integration testing

- [ ] 6.1 Write an integration test demonstrating end-to-end body validation: a controller with `@OasRequestBody` + `@Body()` + `@Validate()`, an OpenAPI spec populated by `SwaggerUiProvider`, and the `OpenApiValidationPipe` validating valid and invalid request bodies
- [ ] 6.2 Write an integration test covering content-type fallback (single content type, no header)
- [ ] 6.3 Write an integration test covering content-type ambiguity error (multiple content types, no header)

## 7. Verification

- [ ] 7.1 Run the full test suite for the new package (`pnpm run --filter "@inversifyjs/http-openapi-validation" test`)
- [ ] 7.2 Run linter and formatter (`pnpm run --filter "@inversifyjs/http-openapi-validation" lint && pnpm run --filter "@inversifyjs/http-openapi-validation" format`)
- [ ] 7.3 Verify `@inversifyjs/http-core` build and tests still pass (`pnpm run --filter "@inversifyjs/http-core" build && pnpm run --filter "@inversifyjs/http-core" test`)
- [ ] 7.4 Verify the full build succeeds (`pnpm run build`)
