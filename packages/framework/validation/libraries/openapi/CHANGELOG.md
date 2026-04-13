# @inversifyjs/open-api-validation

## 3.1.0

### Minor Changes

- Added `@inversifyjs/open-api-validation` package for OpenAPI-driven request body validation. Includes `OpenApiValidationPipe` for both OpenAPI v3.1 and v3.2, with Ajv-based schema validation and content-type resolution. It also includes a `ValidatedBody` decorator for easy integration with InversifyJS controllers.

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@5.3.0
  - @inversifyjs/http-open-api@5.3.0
  - @inversifyjs/open-api-utils@0.2.0
  - @inversifyjs/json-schema-utils@0.2.0
  - @inversifyjs/validation-common@3.1.0
