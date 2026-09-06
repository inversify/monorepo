# @inversifyjs/json-schema-2-type-metadata

## 0.3.0

### Minor Changes

Unify TypeMetadata nodes that share an id when they denote the same type, and keep throwing when that id names two different types.

## 0.2.0

### Minor Changes

- Added optional `dynamicScopeEntries` to `TransformJsonSchemaContext`.
- Added `TransformJsonSchemaContext`.
- Added `transformJsonSchema`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-utils@0.5.0
  - @inversifyjs/json-schema-type-metadata@0.2.0
