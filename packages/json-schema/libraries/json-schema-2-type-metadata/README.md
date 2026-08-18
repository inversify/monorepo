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
import {
  buildTransformJsonSchemaContext,
  transformJsonSchema,
} from '@inversifyjs/json-schema-2-type-metadata/2020-12';

const context = buildTransformJsonSchemaContext({ schema });

const typeMetadata = transformJsonSchema(schema, context);
```

### References

The transformer never resolves a URI on its own, since the document a `$ref`
points at might live somewhere it has no access to, such as an OpenAPI
document. Supply those schemas through `referenceMap`, keyed by the exact
reference value:

```ts
const context = buildTransformJsonSchemaContext({
  referenceMap: new Map([['https://example.com/tree', treeSchema]]),
  schema,
});
```

Plain name fragments are the exception. `buildTransformJsonSchemaContext`
indexes the entry schema and every `referenceMap` value into resources
delimited by `$id`, so a reference such as `#node` resolves against the
`$anchor` and `$dynamicAnchor` declarations of the resource it appears in, and
only falls back to `referenceMap` when the current resource declares no such
name.

Indexing is eager, and `contentSchema` subschemas are not reached by it.

### Dynamic references

`$dynamicRef` resolves to the outermost resource in the dynamic scope declaring
the referenced `$dynamicAnchor`, so a schema extending another one contributes
its own constraints to the recursive positions of the schema it extends:

```ts
const context = buildTransformJsonSchemaContext({
  referenceMap: new Map([['https://example.com/tree', treeSchema]]),
  schema: strictTreeSchema,
});

// Every node of the tree is typed as a strict tree node.
const typeMetadata = transformJsonSchema(strictTreeSchema, context);
```

A reference carrying a path part, such as
`https://example.com/tree#node`, still needs a `referenceMap` entry under that
exact value to find its initial target before the dynamic substitution is
applied.

### Transforming a subschema

A context may be reused to transform any subschema of the documents it indexed,
which keeps the anchors of the owning resource resolvable:

```ts
const context = buildTransformJsonSchemaContext({ schema: document });

const typeMetadata = transformJsonSchema(document.$defs.node, context);
```
