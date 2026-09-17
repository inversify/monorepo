# @inversifyjs/open-api-2-typescript

## 0.3.0

### Minor Changes

- Added generated TypeScript aliases for operation path, query, querystring, header, and cookie parameters in the `Root` union.
- Added `prefixItems`, `minItems`, and `maxItems` support to `ArrayTypeMetadata` so JSON Schema tuple arrays become TypeScript unions of possible tuple lengths.

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-type-metadata@0.3.0
  - @inversifyjs/json-schema-2-type-metadata@0.4.0
  - @inversifyjs/json-schema-2-typescript@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.3.1
  - @inversifyjs/json-schema-2-typescript@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.3.0
  - @inversifyjs/json-schema-2-typescript@0.2.1

## 0.2.0

### Minor Changes

- Added `@inversifyjs/open-api-2-typescript` with `transformOpenApiToTypeScript`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/json-schema-2-type-metadata@0.2.0
  - @inversifyjs/json-schema-2-typescript@0.2.0
  - @inversifyjs/json-schema-utils@0.5.0
  - @inversifyjs/json-schema-type-metadata@0.2.0
  - @inversifyjs/open-api-utils@0.3.1
