---
"@inversifyjs/json-schema-utils": minor
---

- Updated `JsonSchemaResolver.resolveSchema` to accept an incoming dynamic scope so nested `$ref` and `$dynamicRef` can be resolved as applicators.
- Added `dynamicScopeEntries` to `SchemaResolutionSuccessTree` and `SchemaResolutionSuccessNode` as `DynamicScopeEntry[]`.
