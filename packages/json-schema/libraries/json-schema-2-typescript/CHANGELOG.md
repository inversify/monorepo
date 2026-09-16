# @inversifyjs/json-schema-2-typescript

## 0.3.0

### Minor Changes

- Added `prefixItems`, `minItems`, and `maxItems` support to `ArrayTypeMetadata` so JSON Schema tuple arrays become TypeScript unions of possible tuple lengths.

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-type-metadata@0.3.0
  - @inversifyjs/json-schema-2-type-metadata@0.4.0

## 0.2.2

### Patch Changes

- Updated metadata parse flow with literal type intersection algorithm.
- Updated metadata parse flow with non titled type simplification algorithm.
- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.3.1

## 0.2.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.3.0

## 0.2.0

### Minor Changes

- Added `transformTypeMetadataToTypeScript`.
- Added `TransformTypeMetadataToTypeScriptOptions`.
- Added `transformJsonSchemaToTypeScript`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.2.0
  - @inversifyjs/json-schema-type-metadata@0.2.0
