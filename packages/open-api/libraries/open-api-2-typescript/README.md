[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fopen-api-2-typescript)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fopen-api-2-typescript)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fopen-api%2Flibraries%2Fopen-api-2-typescript%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/open-api-2-typescript)

# @inversifyjs/open-api-2-typescript

Inversify monorepo open-api-2-typescript modules.

This package prints TypeScript type declarations from OpenAPI documents by
collecting `components.schemas` and composing
[`@inversifyjs/json-schema-2-typescript`](../../../json-schema/libraries/json-schema-2-typescript).
A schema `title` is used as the TypeScript name when present; otherwise the
component key is used. The generated `Root` type is the union of those schemas.

Currently supported OpenAPI versions:

- `@inversifyjs/open-api-2-typescript/v3Dot1`
- `@inversifyjs/open-api-2-typescript/v3Dot2`

## Usage

```ts
import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot1';

const typeScript = transformOpenApiToTypeScript({
  components: {
    schemas: {
      User: {
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
        type: 'object',
      },
    },
  },
  info: { title: 'API', version: '1.0.0' },
  openapi: '3.1.0',
});
```
