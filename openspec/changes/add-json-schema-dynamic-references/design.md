## Context

See [proposal.md](proposal.md) for motivation. The design-relevant state of `@inversifyjs/json-schema-2-type-metadata` is small:

- `transformJsonSchema(schema, context)` is the only exported function. It recurses over applicator keywords and pushes each result into a `typeConstraints` array that `buildTypeMetadata` collapses into a single `TypeMetadata`.
- `context.referenceMap: Map<string, JsonRootSchema | JsonSchema>` is a flat, caller-owned map consulted with the raw `$ref` string. The package performs no URI handling of any kind.
- `context.jsonSchemaToTypeMap: Map<JsonSchema, TypeMetadata>` serves double duty: memoisation and cycle detection. A placeholder `Partial<TypeMetadata>` is inserted before recursing, re-entry returns that same object reference, and `buildTypeMetadata` degrades a still-`kind`-less placeholder to `anyType`. Recursion is therefore expressed as a cyclic object graph.

Three constraints shape everything below.

**The library must not interpret URIs.** `$id` values may be relative, may be `urn:`, and may name a document the caller never supplies — a schema embedded in an OpenAPI file is the motivating case. Resolving external identifiers stays the caller's job through `referenceMap`, which keeps its current type.

**`$dynamicAnchor` only ever creates plain-name fragments** ([core §8.2.2](https://json-schema.org/draft/2020-12/json-schema-core.html)). A `$dynamicRef` can therefore only behave dynamically when its fragment is a plain name, and a *bare* `#name` is by construction relative to the current schema resource. This is what makes the feature implementable without URI resolution: for `#name` the answer is local, and for `tree#node` we hand the whole string to `referenceMap` and read only the text after `#`.

**Anchor names are resource-scoped, so a flat string map cannot hold them.** Two resources in one document may each declare `$dynamicAnchor: "node"`. The package needs a real notion of schema resource before it can resolve any plain name correctly.

## Goals / Non-Goals

**Goals:**

- Model schema resources and per-resource anchor tables using object identity, with zero URI parsing.
- Represent the dynamic scope in a form that makes the memo sound *and* makes recursive dynamic references terminate — these two pull against each other and are the crux of the design.
- Keep `transformJsonSchema(schema, context)` callable on a subschema of an already-indexed document.
- Keep recursion expressed exactly as it is today, as a shared cyclic `TypeMetadata` graph, so no new `TypeMetadataKind` is needed.

**Non-Goals:**

- Resolving, normalising, or fetching any URI, including composing a base URI from nested `$id` values.
- Extending the applicator coverage of `transformJsonSchema`. `not`, `if`/`then`/`else`, `prefixItems`, `contains`, `patternProperties`, and the `unevaluated*` keywords remain unhandled; this change only adds `$dynamicRef` alongside the existing `$ref`. The registry pre-pass does walk them, because indexing must be complete even where transformation is not.
- Emitting named type aliases for recursive types. That needs a new `TypeMetadata` kind and a renderer, neither of which exists.
- Sharing the registry with other packages. See Open Questions.

## Decisions

### 1. Resource identity is the schema object that roots the resource

A resource is represented by a record whose identity is its root schema object:

```typescript
export interface JsonSchemaResource {
  anchorMap: Map<string, JsonRootSchema | JsonSchema>;
  dynamicAnchorMap: Map<string, JsonRootSchema | JsonSchema>;
  index: number;
}
```

`anchorMap` holds the `$anchor` names and `dynamicAnchorMap` the `$dynamicAnchor` ones. `$dynamicAnchor` also creates an ordinary plain-name fragment, which is honoured at lookup time by consulting `dynamicAnchorMap` before `anchorMap` rather than by indexing those names twice. `index` exists only for canonicalisation (Decision 4).

The record carries no back-reference to its root schema: nothing in resolution needs one, since `resourceMap` already answers the only question asked of a schema object, which resource owns it.

**Rationale**: the only thing resolution actually needs from `$id` is *where one resource ends and the next begins*. That is a lexical fact, readable without understanding the URI. Object identity gives free, correct, collision-proof resource equality, and it degrades gracefully: a schema the caller never indexed simply gets its own anonymous resource.

**Alternatives considered**:

- *Registry keyed by resolved absolute URI.* The standard implementation strategy, and what a validator would do. Rejected: it requires composing nested `$id` values against a base URI the caller may not have, and it would make an unreachable `$id` an error rather than a non-event.
- *Resource keyed by JSON Pointer within its document.* Requires carrying a document identity alongside every pointer, and pointers are strings to build and compare on a hot path. Object identity is strictly cheaper.

### 2. The registry is built by one lexical pre-pass reusing `traverse`

`buildTransformJsonSchemaContext({ schema, referenceMap })` indexes the entry schema and every value of `referenceMap` into:

```typescript
resourceList: JsonSchemaResource[];
resourceMap: Map<JsonRootSchema | JsonSchema, JsonSchemaResource>;
```

where `resourceMap` maps *every* indexed schema object to its owning resource, and `resourceList` holds every resource in creation order so that a new one can take the next `index` (Decision 4). Each document is walked with `traverse` from `@inversifyjs/json-schema-utils`, which visits every subschema in depth-first document order with its JSON Pointer and — importantly — does not follow references. A stack of `{ pointer, resource }` pairs reconstructs resource nesting: before handling a node, pop while the node's pointer is not the stack top's pointer or a descendant of it (`pointer === top || pointer.startsWith(`${top}/`)`); then push a new resource if the node declares `$id` or the stack is empty.

**Rationale**: resource boundaries are purely lexical, which is exactly what `traverse` gives, and it already walks `$defs` — the one place anchors commonly hide and where `transformJsonSchema` never goes. Depth-first document order makes the prefix-stack reconstruction sound without a second data structure. Reusing `traverse` means the walk is already tested; `@inversifyjs/json-schema-utils` becomes a production dependency of this package.

**Alternatives considered**:

- *Hand-rolled walker inside this package.* Duplicates the keyword-to-handler table that `traverse` already owns and would drift from it. Rejected.
- *Extending `traverse` to report the enclosing `$id` scope.* Cleaner for future consumers, but it changes a published package's callback contract for the benefit of one caller. Deferred; see Open Questions.
- *Lazy indexing on first anchor lookup.* Cannot work: the bookending rule needs to know whether a resource declares a name *anywhere*, including in branches transformation never reaches.

Boolean schemas are deliberately excluded from `resourceMap`. `true` and `false` are primitives, so every `true` in every document would collide on one `Map` key. They cannot declare `$id`, anchors, or references, and `transformJsonSchema` short-circuits them before any scope is consulted, so omitting them is free.

### 3. The dynamic scope is an immutable first-writer-wins binding map, not a stack

This is the load-bearing decision.

[Core §8.2.3.2](https://json-schema.org/draft/2020-12/json-schema-core.html) says a bookended `$dynamicRef` resolves against *the outermost schema resource in the dynamic scope that declares the same name with `$dynamicAnchor`*. Rather than store the scope as an ordered stack of resources and search it outermost-first per lookup, store the answer directly:

```typescript
export interface DynamicAnchorBindings {
  key: string;
  nameToResourceMap: ReadonlyMap<string, JsonSchemaResource>;
}

export interface TransformJsonSchemaScope {
  dynamicAnchorBindings: DynamicAnchorBindings;
  resource: JsonSchemaResource;
}
```

The scope is threaded down the recursion as an ordinary parameter, so unwinding is implicit — a sibling branch simply receives its parent's value. Entering a resource extends the bindings with every name in that resource's `dynamicAnchorMap` **that is not already bound**, and returns the *same* object when nothing new is added:

```typescript
function extendDynamicAnchorBindings(
  bindings: DynamicAnchorBindings,
  resource: JsonSchemaResource,
): DynamicAnchorBindings {
  let nextNameToResourceMap: Map<string, JsonSchemaResource> | undefined;

  for (const name of resource.dynamicAnchorMap.keys()) {
    if (!bindings.nameToResourceMap.has(name)) {
      nextNameToResourceMap ??= new Map(bindings.nameToResourceMap);
      nextNameToResourceMap.set(name, resource);
    }
  }

  return nextNameToResourceMap === undefined
    ? bindings
    : {
        key: buildDynamicAnchorBindingsKey(nextNameToResourceMap),
        nameToResourceMap: nextNameToResourceMap,
      };
}
```

**Rationale**: first-writer-wins per name *is* the "outermost wins" rule, because the map is only ever extended while descending. Collapsing the stack into a map buys three things at once: lookups are O(1) instead of a scan; the whole scope becomes a single comparable value usable as a memo key (Decision 4); and, decisively, **re-entering an already-bound resource is a no-op, so the scope reaches a fixed point and recursion terminates.**

That last point is the difference between a design that works and one that does not. Take the specification's own example. Transformation begins at `strict-tree`, so bindings become `{node → strict-tree}`. Following `$ref` into `tree` adds nothing, because `node` is already bound. The `$dynamicRef: "#node"` inside `tree` resolves through the bindings to `strict-tree`, and `strict-tree` is re-entered *under the same bindings* — which the memo recognises as already in progress, closing the cycle through the existing placeholder mechanism. A scope modelled as a stack would instead grow `[strict-tree, tree, strict-tree, tree, …]` without bound, and any memo keyed on it would never hit.

**Alternatives considered**:

- *Ordered stack of resources, searched outermost-first.* Faithful to the spec's phrasing and fine for a validator, which is driven by a finite instance document and so terminates for other reasons. Fatal here: transformation is driven by the schema alone, so nothing bounds the recursion.
- *Stack for lookup plus a separate "seen resource" set for cycle detection.* A `(schema, resourceSet)` key would terminate, but the set is coarser than the bindings map — it distinguishes scopes that resolve every anchor identically, producing duplicate types for no reason.
- *Mutable push/pop of a shared scope.* Cheaper allocation-wise, but the memo hands out shared `TypeMetadata` nodes across branches, so a scope that mutates under an already-memoised subtree is a correctness hazard for the sake of a few objects that are only allocated when a resource is entered.

### 4. The memo is keyed on `(schema object, bindings)` via a canonical bindings key

`jsonSchemaToTypeMap` is replaced by a two-level map:

```typescript
schemaToBindingsToTypeMap: Map<JsonRootSchema | JsonSchema, Map<string, TypeMetadata>>;
```

The inner key is `DynamicAnchorBindings.key`: the bindings rendered as `name:resourceIndex` pairs sorted by name and joined, computed once in `extendDynamicAnchorBindings` and cached on the object. Empty bindings give the empty string, so a schema with no dynamic anchors anywhere keeps exactly one memo bucket and behaves as it does today.

Cycle detection is unchanged in mechanism: the `Partial<TypeMetadata>` placeholder is inserted into the inner map before recursing, and `buildTypeMetadata` keeps its `kind === undefined` degradation. Only the key changes.

**Rationale**: memoising on the schema object alone is unsound the moment resolution depends on the dynamic scope — the first computed result would be served to every later scope, which is precisely the bug `$dynamicAnchor` exists to avoid. A canonical string key gives structural equality without an interner, and because bindings objects are created only when a resource contributes a new name, the key is built a handful of times per transform rather than per node.

**Termination argument**: bindings are monotone along any path and each name binds at most once, so the set of reachable `DynamicAnchorBindings` values is finite (bounded by anchor names × resources). The placeholder is inserted before recursing, so each `(schema, key)` pair is expanded at most once. Both factors are finite, therefore the transform halts.

**Alternatives considered**:

- *Interning bindings into a trie and keying on object identity.* Avoids string building; adds a data structure and a lifetime concern. The string key is simpler and the allocation count is already low.
- *Keying on only the anchor names a subtree actually consults, discovered by recording lookups during the subtree's transformation.* Strictly better reuse — it would let subtrees that ignore `node` share one entry across all `node` bindings — but it needs dependency tracking through the placeholder mechanism. Premature; revisit if duplication is ever measured to matter.

### 5. Scope transitions are derived from `resourceMap`, not from re-reading `$id`

At transform time, entering a schema is uniform:

```typescript
function enterSchema(
  schema: JsonRootSchema | JsonSchema,
  context: TransformJsonSchemaContext,
  scope: TransformJsonSchemaScope,
): TransformJsonSchemaScope {
  const resource: JsonSchemaResource | undefined = context.resourceMap.get(schema);

  if (resource === undefined || resource === scope.resource) {
    return scope;
  }

  return {
    dynamicAnchorBindings: extendDynamicAnchorBindings(
      scope.dynamicAnchorBindings,
      resource,
    ),
    resource,
  };
}
```

**Rationale**: because `resourceMap` maps every schema object to its owning resource, one identity comparison covers all three ways the dynamic scope can change — descending lexically into an `$id` subschema, following a `$ref`, and following a `$dynamicRef` — with no keyword inspection at transform time. It also handles the awkward case of a nested resource referencing back into its parent: the parent is re-entered, `extendDynamicAnchorBindings` finds every name already bound, and the bindings object is returned unchanged, so the memo still hits.

`transformJsonSchema` keeps its public signature and seeds the initial scope from `resourceMap.get(schema)`, falling back to a synthetic anonymous resource when the schema was never indexed. This satisfies the specification's rule that the outermost dynamic scope is the schema where processing begins even when it does not root a resource, and it is what keeps transforming a subschema of an indexed document working.

### 6. `$dynamicRef` resolution splits on the presence of a path part

Given the raw keyword value, take `fragment` as the text after the first `#` and `pathPart` as the text before it. A plain name matches `/^[A-Za-z_][A-Za-z0-9._-]*$/` per [core §8.2.2](https://json-schema.org/draft/2020-12/json-schema-core.html).

Finding the initial target is the same operation for `$ref` and `$dynamicRef`, so both share one `resolveJsonSchemaReference`. When `pathPart` is empty and `fragment` is a plain name, it looks the name up in the current resource — `dynamicAnchorMap` first, then `anchorMap` — and falls back to `referenceMap` with the raw string. Every other form goes straight to `referenceMap`, as `$ref` does today. A reference that cannot be found at all throws, naming the value and, for `$dynamicRef`, the keyword.

`$dynamicRef` then applies the dynamic substitution on top of that target. The bookending condition is checked against the target's own resource: it holds when that resource's `dynamicAnchorMap` maps `fragment` to the target itself, with `target.$dynamicAnchor === fragment` as the fallback for a target the builder never indexed. When it holds, the applied schema becomes the declaration for that name in `scope.dynamicAnchorBindings.nameToResourceMap.get(fragment)`; when it does not hold, or no resource in scope declares the name, the initial target is applied directly — which is the spec's "otherwise identical to `$ref`".

Checking bookending against the resolved target rather than at lookup time is what lets the bare and path-bearing forms share the lookup: a bare `#node` that resolves through `dynamicAnchorMap` satisfies the check by construction, and one that resolves through `anchorMap` or `referenceMap` fails it, which is the intended static behaviour.

**Rationale**: this is the minimum machinery that makes the spec's rule true without URI resolution. The bare form is the one that must be resource-relative and is the one we can answer locally; the path-bearing form is already the caller's responsibility, and extracting a fragment by splitting on `#` is not URI interpretation — it is the one piece of syntax [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) guarantees regardless of scheme.

Registry lookup deliberately takes precedence over `referenceMap` for plain names. A `referenceMap` entry keyed `"#node"` is ambiguous when two resources declare `node`, so the map cannot express the correct answer; the registry can. Callers keep the fallback for anchors the builder never saw.

**Alternatives considered**:

- *`referenceMap` first, registry second.* Preserves existing behaviour byte-for-byte for callers who pre-registered plain names. Rejected because it lets an ambiguous entry shadow the correct resource-scoped answer.
- *Rejecting `$dynamicRef` with a path part.* Simpler, and covers the common single-document case. Rejected: cross-document extension is the primary real-world use, since that is how meta-schemas extend one another.

### 7. `TypeMetadata.id` collisions are accepted for now

`id` is populated from `title`, and a schema instantiated under two distinct dynamic scopes now yields two types carrying the same `id`. Nothing in the monorepo reads `id`, so this changes no observable behaviour today. A future renderer that emits named aliases will have to disambiguate, and it will have the information to do so — the bindings key that produced each instance.

**Alternatives considered**: deriving a suffixed `id` per dynamic scope. Rejected as speculative; the naming scheme should be chosen by whatever consumes `id`, not guessed here.

## Risks / Trade-offs

- **Combinatorial growth of binding sets.** In principle the number of distinct `DynamicAnchorBindings` values is anchor names × resources, so a pathological document could multiply the work per schema. → Real schemas declare one or two dynamic anchors (`node`, `meta`); the fixed-point property means each is bound once per path. Add a unit test asserting the reachable binding-key count for the `tree`/`strict-tree` pair is 1, so a regression that reintroduces stack-like growth fails loudly rather than merely getting slower.
- **The same schema object aliased into two resources.** `resourceMap` is keyed by object identity, so a caller who puts one object into `referenceMap` under two keys, or embeds one object at two points with different `$id` ancestors, gets last-indexed-wins. → Document that schema objects belong to exactly one resource. This matches how JSON documents parse; only hand-built object graphs can violate it.
- **`contentSchema` is not walked by `traverse`.** Anchors declared inside `contentSchema` will not be indexed. → `transformJsonSchema` does not handle `contentSchema` either, so nothing regresses; record it as a known gap and fix it in `@inversifyjs/json-schema-utils` when `contentSchema` support is added.
- **Duplicate anchor names within one resource are undefined behaviour** per [core §8.2.2](https://json-schema.org/draft/2020-12/json-schema-core.html), which permits implementations to raise. → Last indexed wins and no error is raised, keeping the pre-pass free of an error path. Revisit if a caller wants strictness.
- **Precedence change for plain-name `$ref`.** A caller relying on a `"#name"` entry in `referenceMap` while the document also declares that anchor now gets the document's answer. → Intentional and spec-correct, documented in the README, and not yet a compatibility concern: the package is unreleased.
- **Registry cost is paid up front.** Every document in `referenceMap` is walked at context-build time even if the transform never reaches it. → Contexts are reusable across transforms, which is why the builder exists; a lazy alternative cannot satisfy the bookending rule (Decision 2).

## Migration Plan

1. Land the registry, scope model, and reference resolution behind the new context shape in one change; the package has no in-repo consumers, so there is no staged rollout to coordinate.
2. Rewrite the README example from an object literal to `buildTransformJsonSchemaContext`, since that literal is what external callers would otherwise copy.
3. Fold the new API into the pending changeset for `@inversifyjs/json-schema-2-type-metadata` rather than adding a breaking one. The package has never been published — its first release is still unreleased at `0.1.0` and that changeset introduces `transformJsonSchema` itself — so there is no published contract to break and a `major` bump would misrepresent the history.
4. Rollback is a straight revert: no persisted state, no schema migration, no cross-package coupling beyond the new `workspace:*` dependency.

## Open Questions

- Should the resource registry eventually move to `@inversifyjs/json-schema-utils` (or arrive there as a `traverse` callback field carrying the enclosing resource) so the OpenAPI packages can reuse it? Deferred deliberately: the shape is easiest to judge once a second consumer exists, and moving it later is a mechanical extraction that changes no behaviour here.
- Should `buildTransformJsonSchemaContext` accept additional documents to index that are not reachable through `referenceMap`? No current use case, and adding the parameter later is backward compatible.
