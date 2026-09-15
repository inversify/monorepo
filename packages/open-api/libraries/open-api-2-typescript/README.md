[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fopen-api-2-typescript)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fopen-api-2-typescript)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fopen-api%2Flibraries%2Fopen-api-2-typescript%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/open-api-2-typescript)

# @inversifyjs/open-api-2-typescript

Inversify monorepo open-api-2-typescript modules.

This package prints TypeScript type declarations from OpenAPI documents by
collecting `components.schemas` and operation parameter schemas and composing
[`@inversifyjs/json-schema-2-typescript`](../../../json-schema/libraries/json-schema-2-typescript).
A schema `title` is used as the TypeScript name when present; otherwise the
component key is used. Operation path, query, querystring, header, and cookie
parameter types are named from the PascalCase `operationId` (or HTTP method plus
path) and a location suffix (`PathParams`, `Query`, `Querystring`, `Headers`,
`Cookies`). A location with no parameters on that operation is omitted.
Operations under both `paths` and `webhooks` are included. The generated `Root`
type is the union of those schemas.

A single `querystring` parameter is unwrapped: the generated type is that
parameter's schema, not an object keyed by the parameter name. Multiple
`querystring` parameters on the same operation are printed as an object keyed by
parameter name.

Parameter and path item `$ref` values are resolved against the document URI,
including fragment-only refs such as `#/components/parameters/Page` and OpenAPI
3.2 `$self`. Refs that do not resolve to a resource in this document are omitted.

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
