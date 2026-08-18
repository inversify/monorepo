All paths are relative to `packages/json-schema/libraries/json-schema-2-type-metadata/`, and `202012/` abbreviates `src/jsonSchema/202012/`. Unit tests follow [docs/testing/unit-testing.md](../../../docs/testing/unit-testing.md) and fixtures follow [docs/testing/fixtures.md](../../../docs/testing/fixtures.md).

## 1. Package setup

- [x] 1.1 Add `@inversifyjs/json-schema-utils: workspace:*` to `dependencies` in `package.json`, move `@inversifyjs/json-schema-types` to `dependencies` only if a value import is introduced, then run `pnpm install` — no value import was introduced, so `json-schema-types` stays a devDependency, matching every other package in the family
- [x] 1.2 Verify `pnpm run --filter "@inversifyjs/json-schema-2-type-metadata" build` still passes before any source change, to establish a clean baseline

## 2. Resource and scope models

- [x] 2.1 Add `202012/models/JsonSchemaResource.ts` with `anchorMap`, `dynamicAnchorMap` and `index` (design Decision 1) — `rootSchema` was dropped as unused
- [x] 2.2 Add `202012/models/DynamicAnchorBindings.ts` with the canonical `key` and the readonly `nameToResourceMap` (design Decision 3)
- [x] 2.3 Add `202012/models/TransformJsonSchemaScope.ts` holding the current `resource` and its `dynamicAnchorBindings`
- [x] 2.4 Reshape `202012/models/TransformJsonSchemaContext.ts`: keep `referenceMap` with its current type, add `resourceMap` and `resourceList`, and replace `jsonSchemaToTypeMap` with `schemaToBindingsToTypeMap` (design Decision 4)
- [x] 2.5 Add `202012/models/BuildTransformJsonSchemaContextParams.ts` taking the entry `schema` and an optional `referenceMap`
- [x] 2.6 Add `202012/models/ParsedJsonSchemaReference.ts` carrying the plain-name `anchor` and whether the reference is resource local

## 3. Registry pre-pass

- [x] 3.1 Add `202012/actions/buildTransformJsonSchemaContext.ts` that indexes the entry schema and every `referenceMap` value, with `202012/actions/buildJsonSchemaResource.ts` assigning each resource its canonicalisation `index`
- [x] 3.2 Implement the per-document walk with `traverse` from `@inversifyjs/json-schema-utils`, reconstructing resource nesting with a `{ jsonPointer, resource }` stack popped by JSON Pointer prefix and pushed on `$id` (design Decision 2)
- [x] 3.3 Populate `anchorMap` from `$anchor` and `dynamicAnchorMap` from `$dynamicAnchor`, with last-indexed-wins on duplicate names and no error raised — the plain-name fragment a `$dynamicAnchor` also creates is honoured at lookup time instead of by double indexing
- [x] 3.4 Skip boolean schemas when populating `resourceMap`, so `true`/`false` cannot collide on a single map key (design Decision 2)
- [x] 3.5 Unit spec: resource partitioning for a nested `$id`, a document with no `$id`, a `urn:` `$id`, a relative `$id`, and an anchor declared under `$defs`
- [x] 3.6 Unit spec: two resources in one document each declaring `$dynamicAnchor: "node"` are indexed independently

## 4. Dynamic anchor bindings

- [x] 4.1 Add `extendDynamicAnchorBindings` under `202012/actions/`, first-writer-wins per name, returning the identical object when no name is added (design Decision 3)
- [x] 4.2 Add `buildDynamicAnchorBindingsKey` producing `name:resourceIndex` pairs sorted by name, with the empty string for empty bindings
- [x] 4.3 Unit spec: extending with a resource whose names are all already bound returns the same object reference
- [x] 4.4 Unit spec: two extension orders that bind the same names to the same resources produce the same `key`

## 5. Scope transitions in the transform

- [x] 5.1 Add `enterJsonSchemaScope` deriving the next scope from `context.resourceMap`, returning the current scope when the owning resource is unchanged or unknown (design Decision 5)
- [x] 5.2 Thread `TransformJsonSchemaScope` through the internal recursion, seeding it in `transformJsonSchema` from the entry schema's owning resource with a synthetic anonymous resource as fallback
- [x] 5.3 Route every existing recursion site — `items`, `additionalProperties`, `properties`, `allOf`, `anyOf`, `oneOf`, `$ref` — through `enterJsonSchemaScope`
- [x] 5.4 Unit spec: transforming a subschema of an indexed document resolves anchors declared elsewhere in the owning resource
- [x] 5.5 Unit spec: transforming a schema the builder never indexed does not throw

## 6. Memoisation keyed by dynamic scope

- [x] 6.1 Rewrite the memo read/write in `transformObjectJsonSchema` against `schemaToBindingsToTypeMap`, keeping the `Partial<TypeMetadata>` placeholder insert-before-recurse order intact
- [x] 6.2 Confirm `buildTypeMetadata` keeps degrading a still-`kind`-less placeholder to `anyType`, so existing `$ref` cycle behaviour is unchanged
- [x] 6.3 Unit spec: one schema reached twice under equivalent bindings yields the same type instance
- [x] 6.4 Unit spec: one schema reached under bindings that resolve a name to two different resources yields two distinct types

## 7. Reference resolution

- [x] 7.1 Add `parseJsonSchemaReference`, splitting a reference on the first `#` and reporting the fragment only when it matches the plain-name pattern `/^[A-Za-z_][A-Za-z0-9._-]*$/`
- [x] 7.2 Add `resolveJsonSchemaReference`, shared by both keywords: a bare `#name` resolves against the current resource's `dynamicAnchorMap` then `anchorMap` and falls back to `referenceMap`, while every other form stays on the `referenceMap` path
- [x] 7.3 Add `resolveDynamicAnchorSchema` checking bookending against the resolved target's resource, with `target.$dynamicAnchor === fragment` as the unindexed fallback (design Decision 6)
- [x] 7.4 Apply the dynamic substitution when bookending holds and the name is bound in scope, and apply the initial target directly otherwise
- [x] 7.5 Add `handleJsonSchemaDynamicRef` and register it in `handleCoreVocabularyProperties` alongside the existing `$ref` handling
- [x] 7.6 Throw for an unresolvable `$ref` naming the value, and for an unresolvable `$dynamicRef` naming both the value and the keyword
- [x] 7.7 Unit spec: the anchor index takes precedence over a same-named `referenceMap` entry; a JSON Pointer fragment still goes through `referenceMap`; an unknown plain name falls back to `referenceMap`
- [x] 7.8 Unit spec: `$dynamicRef` whose target declares only `$anchor` behaves as `$ref`; `$dynamicRef` whose name is unbound in scope applies the initial target

## 8. Specification fixtures and end-to-end behaviour

- [x] 8.1 Add `202012/fixtures/JsonRootSchemaFixtures.ts` with the `tree` and `strict-tree` resources from [core §8.2.3.2](https://json-schema.org/draft/2020-12/json-schema-core.html), with `strict-tree` contributing a required `name` property so the dynamic difference is observable in `TypeMetadata`
- [x] 8.2 Unit spec: starting at `strict-tree`, the type for the items of `children` includes the required `name` property
- [x] 8.3 Unit spec: starting at `tree`, the type for the items of `children` does not include `name`
- [x] 8.4 Unit spec: both transforms return a type and neither overflows the stack
- [x] 8.5 Unit spec: a single resource recursing into itself through `$dynamicRef: "#node"` produces a type whose recursive position is the same instance
- [x] 8.6 Unit spec: the reachable binding-key count for the `tree`/`strict-tree` pair is 1, guarding against a regression to stack-like scope growth
- [x] 8.7 Unit spec: a `$dynamicRef` with a path part resolves its initial target through `referenceMap` and substitutes the outermost in-scope declaration
- [x] 8.8 Unit spec: with three resources in scope where the outermost and innermost both declare `node`, resolution selects the outermost

## 9. Public surface, docs, and release

- [x] 9.1 Export `buildTransformJsonSchemaContext` and the new types from `202012/index.ts`, keeping `transformJsonSchema` and `TransformJsonSchemaContext` exported
- [x] 9.2 Rewrite the README example from a context object literal to `buildTransformJsonSchemaContext`, and document the plain-name precedence change and the `contentSchema` indexing gap
- [x] 9.3 Fold the new API into the pending `minor` changeset for `@inversifyjs/json-schema-2-type-metadata` instead of adding a `major` one, since the package has never been published
- [x] 9.4 Run `pnpm run --filter "@inversifyjs/json-schema-2-type-metadata" format`, `lint`, `build`, and `test`
- [x] 9.5 Run `pnpm run unused` and confirm `knip` reports no unused or undeclared dependency for the package
- [x] 9.6 Run `pnpm run --filter "@inversifyjs/json-schema-2-type-metadata" test:coverage` and confirm coverage is maintained or improved — it reaches 100% statements, branches, functions and lines
