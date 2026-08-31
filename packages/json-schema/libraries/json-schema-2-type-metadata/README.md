[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-2-type-metadata)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-2-type-metadata)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fjson-schema%2Flibraries%2Fjson-schema-2-type-metadata%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/json-schema-2-type-metadata)

# @inversifyjs/json-schema-2-type-metadata

Inversify monorepo json-schema-2-type-metadata modules.

This package transforms JSON Schema documents into
[`@inversifyjs/json-schema-type-metadata`](../json-schema-type-metadata)'s
`TypeMetadata` intermediate representation.

Transformers are organized by JSON Schema draft, each one exposed through its
own subpath export. Currently supported drafts:

- `@inversifyjs/json-schema-2-type-metadata/2020-12`

## Usage

```ts
import { JsonSchemaResolver } from '@inversifyjs/json-schema-utils/2020-12';
import { transformJsonSchema } from '@inversifyjs/json-schema-2-type-metadata/2020-12';

const schemaById = new Map([
  [schema.$id, schema],
]);

const typeMetadata = transformJsonSchema(schema, {
  resolver: new JsonSchemaResolver((id) => schemaById.get(id)),
});
```
