# @inversifyjs/json-schema-utils

## 0.5.1

### Patch Changes

- Parity version.
- Updated dependencies
  - @inversifyjs/common@2.0.2
  - @inversifyjs/json-schema-pointer@2.0.1
  - @inversifyjs/uri@1.0.1

## 0.5.0

### Minor Changes

- Updated `JsonSchemaResolver.resolveSchema` to accept an incoming dynamic scope so nested `$ref` and `$dynamicRef` can be resolved as applicators.
- Added `dynamicScopeEntries` to `SchemaResolutionSuccessTree` and `SchemaResolutionSuccessNode` as `DynamicScopeEntry[]`.

## 0.4.0

### Minor Changes

- Added `JsonSchemaResolver`.
- Updated `TraverseJsonSchemaCallback` with optional `TraverseJsonSchemaCallbackParamsResult`.

## 0.3.0

### Minor Changes

- Updated `traverse` to provide `rootSchema` instead of parent schema.

## 0.2.0

### Minor Changes

- Added `traverse`
