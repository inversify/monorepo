## Why

`transformJsonSchema` in [packages/json-schema/libraries/json-schema-2-type-metadata/src/jsonSchema/202012/actions/transformJsonSchema.ts](packages/json-schema/libraries/json-schema-2-type-metadata/src/jsonSchema/202012/actions/transformJsonSchema.ts) resolves `$ref` but silently ignores `$anchor`, `$dynamicAnchor`, and `$dynamicRef`. A schema using the standard 2020-12 extensible-recursion idiom — the `tree` / `strict-tree` pair from [JSON Schema core §8.2.3.2](https://json-schema.org/draft/2020-12/json-schema-core.html) — transforms today into a type that is silently wrong: the `$dynamicRef` contributes no constraint at all, so `children` items degrade to `any`. Since `$dynamicAnchor`/`$dynamicRef` is the mechanism JSON Schema itself uses to make meta-schemas extensible, any consumer transforming real-world 2020-12 documents (including OpenAPI documents that embed them) hits this.

Two properties of the current implementation block a correct fix, and neither can be patched locally:

1. **There is no notion of a schema resource.** Per [core §8.2.2](https://json-schema.org/draft/2020-12/json-schema-core.html), `$anchor` and `$dynamicAnchor` names are scoped to the schema resource that contains them — the nearest enclosing `$id`. `transformJsonSchema` never looks at `$id`, never walks `$defs`, and delegates all name resolution to a flat, caller-supplied `referenceMap: Map<string, JsonSchema>`. A flat string map cannot express a resource-relative plain-name fragment: two resources in the same document may each declare `$dynamicAnchor: "node"`, and `"#node"` alone does not say which one is meant.

2. **`context.jsonSchemaToTypeMap` is keyed by schema object alone, which becomes unsound.** Dynamic resolution means the *same* schema object yields a *different* type depending on the dynamic scope it is reached through — that is the entire point of the keyword. The existing memo would serve the first computed result to every later dynamic scope. Keying the memo on the dynamic scope *stack* instead does not terminate: the spec's own `strict-tree` example produces the unbounded stack `[strict-tree, tree, strict-tree, tree, …]`.

## What Changes

- **Add a schema resource registry** built once per transform, before any type is produced. A pre-pass walks the entry schema and every schema reachable through `context.referenceMap`, splitting each document into schema resources at every subschema declaring `$id`, and records per resource: its `$anchor` names, its `$dynamicAnchor` names, and which resource each schema object belongs to. Resource **identity is the schema object that roots it** (object identity), never a parsed or resolved URI — the library therefore performs no URI resolution and needs no access to documents the caller has not supplied.
- **Track the dynamic scope as an immutable, first-writer-wins dynamic-anchor binding map** (`anchor name → schema resource`) threaded down the recursion rather than as a scope stack. Because `$dynamicRef` always selects the *outermost* resource in the dynamic scope defining the name, first-writer-wins is exactly the specified rule, and re-entering an already-bound resource is a no-op — so the bindings reach a fixed point and recursion terminates.
- **Key the memo on `(schema object, dynamic-anchor bindings)`** instead of on the schema object alone. Bindings are canonicalised so that equal binding sets share one memo bucket. This restores soundness without losing the existing cycle-detection behaviour: a dynamic cycle re-enters the same `(schema, bindings)` pair and hits the in-progress placeholder exactly as `$ref` cycles do today.
- **Resolve `$dynamicRef`** per [core §8.2.3.2](https://json-schema.org/draft/2020-12/json-schema-core.html), including the bookending requirement. A bare plain-name form (`#node`) is resolved against the current resource's `$dynamicAnchor` table; a form carrying a path part (`tree#node`, `https://example.com/tree#node`) is delegated to `context.referenceMap` exactly like `$ref`, and only the fragment after `#` is inspected to decide whether the bookend holds. When the bookend does not hold, behaviour is identical to `$ref`.
- **Resolve `$anchor`** for `$ref`: a plain-name fragment now resolves against the current resource's `$anchor`/`$dynamicAnchor` tables, falling back to `context.referenceMap` when the registry has no such anchor.
- **Reshape `TransformJsonSchemaContext`.** `jsonSchemaToTypeMap` is replaced by a two-level memo, and the resource registry and canonicalisation state are added. Callers no longer construct the context as an object literal.
- **Add an exported `buildTransformJsonSchemaContext`** as the supported way to obtain a context. `transformJsonSchema(schema, context)` keeps its signature, so transforming a subschema of an already-registered document remains possible.
- `context.referenceMap` keeps its current type and stays entirely caller-owned. Resolving a URI such as `$id` or an absolute `$ref` is explicitly out of scope: the referenced document may be an OpenAPI file the library cannot reach.

## Capabilities

### New Capabilities
- `json-schema-dynamic-references`: Resource-scoped resolution of `$anchor`, `$dynamicAnchor`, and `$dynamicRef` when transforming a JSON Schema 2020-12 document into `TypeMetadata`, including dynamic-scope tracking, the bookending rule, memoisation keyed by dynamic scope, and termination on recursive dynamic references.

### Modified Capabilities
_None. `transformJsonSchema` has no existing spec under `openspec/specs/`._

## Impact

- **Modified package**: `@inversifyjs/json-schema-2-type-metadata` — new resource-registry pre-pass, new dynamic-scope model, rewritten reference handling in `transformJsonSchema`, new `buildTransformJsonSchemaContext` entry point, reshaped `TransformJsonSchemaContext`.
- **New dependency**: `@inversifyjs/json-schema-utils` (`workspace:*`) is promoted to a production dependency; its `traverse` action performs the purely lexical walk the registry pre-pass needs. `@inversifyjs/json-schema-types` moves from `devDependencies` to `dependencies` only if a value (not type) import is introduced — currently it is not.
- **Changeset level**: no new changeset. `TransformJsonSchemaContext` changes shape incompatibly, but the package has never been published — it sits at an unreleased `0.1.0` behind a pending `minor` changeset that introduces `transformJsonSchema` itself — so the reshape is folded into that changeset instead of being released as a break.
- **Behavioural change (intentional)**: schemas containing `$dynamicRef` now contribute real constraints instead of being dropped. A schema whose `$ref` is a plain-name fragment resolves through the registry in preference to a `referenceMap` entry of the same string; callers who registered `"#name"` keys manually get resource-correct resolution instead.
- **Unchanged**: the `TypeMetadata` model in `@inversifyjs/json-schema-type-metadata` needs no new kind. Recursion keeps being expressed as a shared/cyclic object graph, as it is for `$ref` today.
- **Docs**: the package README example, which constructs the context as an object literal, must be rewritten around `buildTransformJsonSchemaContext`.
- **Tests**: new unit specs for the registry pre-pass, binding canonicalisation, and `$dynamicRef` resolution; the `tree`/`strict-tree` pair from the specification is added as the canonical regression fixture, together with a termination test asserting the transform completes rather than overflowing the stack.
