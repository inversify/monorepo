[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-type-metadata)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fjson-schema-type-metadata)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fjson-schema%2Flibraries%2Fjson-schema-type-metadata%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/json-schema-type-metadata)

# @inversifyjs/json-schema-type-metadata

Inversify monorepo json-schema-type-metadata modules.

This package provides an intermediate representation (`TypeMetadata`) used to
describe structural types independently of any specific JSON Schema draft.
It's consumed by transformer packages such as
[`@inversifyjs/json-schema-2-type-metadata`](../json-schema-2-type-metadata),
which map a given JSON Schema draft onto this representation.
