[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-2-typescript)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-2-typescript)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fjson-schema%2Flibraries%2Fjson-schema-2-typescript%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/json-schema-2-typescript)

# @inversifyjs/json-schema-2-typescript

Inversify monorepo json-schema-2-typescript modules.

This package prints TypeScript type declarations from
[`@inversifyjs/json-schema-type-metadata`](../json-schema-type-metadata)'s
`TypeMetadata` intermediate representation.

JSON Schema documents can be converted through the draft-specific facade, which
composes [`@inversifyjs/json-schema-2-type-metadata`](../json-schema-2-type-metadata)
with the printer. Currently supported drafts:

- `@inversifyjs/json-schema-2-typescript/2020-12`

## Usage

```ts
import { JsonSchemaResolver } from '@inversifyjs/json-schema-utils/2020-12';
import { transformJsonSchemaToTypeScript } from '@inversifyjs/json-schema-2-typescript/2020-12';

const schemaById = new Map([
  [schema.$id, schema],
]);

const typeScript = transformJsonSchemaToTypeScript(schema, {
  resolver: new JsonSchemaResolver((id) => schemaById.get(id)),
});
```

From `TypeMetadata` directly:

```ts
import { transformTypeMetadataToTypeScript } from '@inversifyjs/json-schema-2-typescript';

const typeScript = transformTypeMetadataToTypeScript(typeMetadata);
```
