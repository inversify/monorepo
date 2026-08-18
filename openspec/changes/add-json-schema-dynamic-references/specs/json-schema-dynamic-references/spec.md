## Purpose

Defines how a JSON Schema 2020-12 document's plain-name identifiers (`$anchor`, `$dynamicAnchor`) and dynamic references (`$dynamicRef`) are resolved when the document is transformed into `TypeMetadata`, so that extensible recursive schemas produce the type the schema author intended instead of silently degrading to `any`.

## ADDED Requirements

### Requirement: Schema resources are delimited by `$id` and identified without URI resolution

A transformation SHALL partition every schema it indexes into schema resources. A subschema declaring `$id` SHALL root a new schema resource covering itself and all of its lexical descendants, except those descendants belonging to a further nested resource. A schema object that declares no `$id` and has no `$id`-declaring lexical ancestor SHALL belong to an anonymous resource rooted at the outermost schema object of its document.

Resource identity SHALL be derived from the schema object that roots the resource, never from the value of `$id`. The transformation SHALL NOT parse, normalise, resolve, or dereference any URI, and SHALL NOT attempt to retrieve any document that the caller has not supplied. The value of `$id` is therefore treated as an opaque marker of a resource boundary.

#### Scenario: A nested `$id` starts a new resource

- **WHEN** a document declares `$id: "https://example.com/root"` and its `$defs/inner` subschema declares `$id: "https://example.com/inner"`
- **THEN** `$defs/inner` and its descendants SHALL belong to the `inner` resource
- **AND** every other schema object of the document SHALL belong to the `root` resource

#### Scenario: A document without `$id` still forms one resource

- **WHEN** a document declares no `$id` anywhere
- **THEN** every schema object of that document SHALL belong to a single anonymous resource rooted at the document's outermost schema object

#### Scenario: An unresolvable or non-URL `$id` is accepted

- **WHEN** a subschema declares `$id: "urn:example:tree"`, or an `$id` value that is a relative reference such as `"tree"`, or an `$id` naming a document the caller has not supplied
- **THEN** the transformation SHALL treat it as a resource boundary and SHALL NOT raise an error
- **AND** the transformation SHALL NOT perform any network or filesystem access

### Requirement: Anchors are indexed per resource and resolve within the current resource

For each schema resource, the transformation SHALL record the plain names declared by `$anchor` and, separately, the plain names declared by `$dynamicAnchor`, by any schema object belonging to that resource. Names declared inside a nested resource SHALL belong to that nested resource only. Indexing SHALL cover subschemas that are not otherwise reachable through applicator keywords, in particular those under `$defs`.

A plain-name fragment SHALL resolve against the resource that owns the schema object where the reference keyword appears, not against the document root and not against a global namespace.

#### Scenario: The same anchor name in two resources resolves independently

- **WHEN** a document contains two resources, each declaring `$dynamicAnchor: "node"` on a different subschema
- **THEN** a plain-name reference to `#node` appearing in the first resource SHALL resolve to the first resource's declaration
- **AND** a plain-name reference to `#node` appearing in the second resource SHALL resolve to the second resource's declaration

#### Scenario: An anchor declared under `$defs` is indexed

- **WHEN** a resource declares `$anchor: "leaf"` on a subschema located at `$defs/leaf`
- **THEN** a reference to `#leaf` from within that resource SHALL resolve to the `$defs/leaf` subschema

#### Scenario: `$dynamicAnchor` also creates a plain-name fragment

- **WHEN** a resource declares `$dynamicAnchor: "node"` on a subschema and a `$ref: "#node"` appears in the same resource
- **THEN** the `$ref` SHALL resolve to that subschema, because `$dynamicAnchor` creates a plain-name fragment in addition to marking an extension point

### Requirement: A plain-name `$ref` fragment resolves through the anchor index before the reference map

When the value of `$ref` is a bare plain-name fragment — a `#` followed by a name starting with a letter or underscore — the transformation SHALL resolve it against the current resource's `$anchor` and `$dynamicAnchor` names. Only when the current resource declares no such name SHALL the transformation fall back to looking the raw `$ref` string up in the caller-supplied reference map.

When the value of `$ref` is any other form — an empty fragment, a JSON Pointer fragment, or a reference carrying a path part — the transformation SHALL resolve it exclusively through the caller-supplied reference map, unchanged from current behaviour.

#### Scenario: The anchor index takes precedence over a same-named reference map entry

- **WHEN** the current resource declares `$anchor: "node"` on subschema `A`
- **AND** the caller-supplied reference map also maps the string `"#node"` to an unrelated schema `B`
- **THEN** a `$ref: "#node"` in that resource SHALL resolve to `A`

#### Scenario: A JSON Pointer fragment still resolves through the reference map

- **WHEN** a schema declares `$ref: "#/$defs/leaf"`
- **THEN** the transformation SHALL resolve it through the caller-supplied reference map and SHALL NOT consult the anchor index

#### Scenario: An unknown plain name falls back to the reference map

- **WHEN** a schema declares `$ref: "#node"`, the current resource declares no `node` anchor, and the reference map maps `"#node"` to a schema
- **THEN** the transformation SHALL resolve it to the reference map entry

### Requirement: `$dynamicRef` resolves to the outermost resource in the dynamic scope declaring the anchor

The transformation SHALL maintain a dynamic scope consisting of every schema resource entered on the path from the schema at which the transformation began to the schema currently being transformed, ordered outermost first. A resource SHALL enter the dynamic scope both when the transformation descends lexically into a subschema that roots it and when the transformation follows a reference into it. The resource containing the schema at which the transformation began SHALL be the outermost member of the dynamic scope, whether or not that schema roots a resource.

When `$dynamicRef` resolves to a schema whose resource declares that plain name with `$dynamicAnchor` — the bookending condition — the transformation SHALL instead apply the declaration belonging to the outermost resource in the current dynamic scope that declares the same name with `$dynamicAnchor`.

Following a reference SHALL NOT discard the dynamic scope accumulated before it: a resource reached through `$ref` SHALL be appended to the dynamic scope of the referring location.

#### Scenario: Extensible recursion resolves to the extending resource

- **WHEN** resource `https://example.com/tree` declares `$dynamicAnchor: "node"` at its root, `type: "object"`, and `properties/children/items` of `{ "$dynamicRef": "#node" }`
- **AND** resource `https://example.com/strict-tree` declares `$dynamicAnchor: "node"` at its root, `$ref` to `https://example.com/tree`, and an additional required property `name` of type `string`
- **AND** the transformation begins at `https://example.com/strict-tree`
- **THEN** the type produced for the items of `children` SHALL include the required `name` property contributed by `strict-tree`

#### Scenario: The same schema transforms differently under a different dynamic scope

- **WHEN** the transformation instead begins at `https://example.com/tree`
- **THEN** the type produced for the items of `children` SHALL be the type of `tree` itself
- **AND** it SHALL NOT include the required `name` property contributed by `strict-tree`

#### Scenario: A dynamic reference carrying a path part is dereferenced through the reference map

- **WHEN** a schema in resource `R` declares `$dynamicRef: "https://example.com/tree#node"`
- **THEN** the transformation SHALL obtain the initial target by looking the raw string up in the caller-supplied reference map
- **AND** it SHALL take `node` as the referenced plain name by reading only the part of the string after `#`
- **AND** when the bookending condition holds it SHALL apply the declaration of the outermost resource in the dynamic scope declaring `node` with `$dynamicAnchor`

#### Scenario: The innermost declaration is not selected

- **WHEN** three resources are in the dynamic scope, ordered outermost first, and the first and third both declare `$dynamicAnchor: "node"`
- **THEN** a `$dynamicRef: "#node"` evaluated in the third resource SHALL resolve to the first resource's declaration

### Requirement: `$dynamicRef` behaves as `$ref` when the bookending condition does not hold

When the schema that `$dynamicRef` initially resolves to does not declare the referenced plain name with `$dynamicAnchor`, the transformation SHALL apply that initially resolved schema directly, with no dynamic-scope lookup. When the bookending condition holds but no resource in the current dynamic scope declares the name with `$dynamicAnchor`, the transformation SHALL likewise apply the initially resolved schema.

#### Scenario: The target declares only `$anchor`

- **WHEN** a schema declares `$dynamicRef: "#node"` and the current resource declares `$anchor: "node"` rather than `$dynamicAnchor: "node"`
- **THEN** the transformation SHALL apply the `$anchor: "node"` subschema directly, exactly as a `$ref: "#node"` would

#### Scenario: A dynamic reference to a resource outside the dynamic scope

- **WHEN** a `$dynamicRef` with a path part resolves through the reference map to a schema declaring the matching `$dynamicAnchor`
- **AND** no resource currently in the dynamic scope declares that name with `$dynamicAnchor`
- **THEN** the transformation SHALL apply the initially resolved schema

### Requirement: Transformation results are memoised per dynamic scope

The transformation SHALL memoise produced types on the pair of the schema object and the dynamic-anchor declarations currently in effect. Two transformations of the same schema object SHALL share a memoised result when, and only when, every `$dynamicAnchor` name reachable in their dynamic scopes is bound to the same resource in both. A memoised result SHALL NOT be shared across dynamic scopes that would resolve any dynamic anchor name differently.

#### Scenario: The same schema under one dynamic scope is transformed once

- **WHEN** a schema object is reached twice through paths whose dynamic-anchor declarations are equivalent
- **THEN** both occurrences SHALL yield the same type instance

#### Scenario: The same schema under differing dynamic scopes yields distinct types

- **WHEN** a schema object is reached through two paths that would resolve the same `$dynamicAnchor` name to two different resources
- **THEN** the transformation SHALL produce a distinct type for each path

### Requirement: Recursive dynamic references terminate

A schema whose dynamic references form a cycle SHALL be transformed to completion without unbounded recursion, and SHALL NOT exhaust the call stack. A dynamic reference that re-enters a schema already being transformed under the same dynamic-anchor declarations SHALL be closed the same way a recursive `$ref` is closed today, producing a shared reference to the in-progress type rather than a copy.

#### Scenario: The specification's extensible recursion example terminates

- **WHEN** the transformation begins at a `strict-tree` resource that extends a `tree` resource through `$ref`, where `tree` recurses through `$dynamicRef: "#node"` and both declare `$dynamicAnchor: "node"`
- **THEN** the transformation SHALL return a type
- **AND** it SHALL NOT throw a stack overflow error

#### Scenario: Self-recursive dynamic reference

- **WHEN** a single resource declares `$dynamicAnchor: "node"` at its root and recurses into itself through `$dynamicRef: "#node"`
- **THEN** the transformation SHALL return a type whose recursive position references the same type instance

### Requirement: Unresolvable references are reported with a descriptive error

When a `$ref` cannot be resolved through either the anchor index or the caller-supplied reference map, the transformation SHALL throw an error naming the unresolved reference value. When a `$dynamicRef` cannot be resolved to any initial target, the transformation SHALL throw an error naming the unresolved dynamic reference value and identifying it as a `$dynamicRef`.

#### Scenario: Unresolvable `$ref`

- **WHEN** a schema declares `$ref: "https://example.com/missing"` and neither the anchor index nor the reference map can resolve it
- **THEN** the transformation SHALL throw an error whose message contains `https://example.com/missing`

#### Scenario: Unresolvable `$dynamicRef`

- **WHEN** a schema declares `$dynamicRef: "#missing"`, the current resource declares no `missing` anchor, and the reference map has no `"#missing"` entry
- **THEN** the transformation SHALL throw an error whose message contains `#missing` and identifies the keyword as `$dynamicRef`

### Requirement: Contexts are obtained from a builder and remain reusable across transformations

A context suitable for transformation SHALL be obtainable from an exported builder that takes the entry schema and the caller-supplied reference map and produces the resource and anchor index. Callers SHALL NOT be required to know the context's internal shape. The transformation entry point SHALL keep accepting a schema and a context, so that a subschema of an already-indexed document can be transformed directly.

The builder SHALL index the entry schema and every schema present as a value of the reference map. A schema that was not indexed SHALL still be transformable: it SHALL be treated as rooting its own anonymous resource declaring no anchors.

#### Scenario: A context indexes reference map values

- **WHEN** a context is built with a reference map whose values include a document declaring `$dynamicAnchor: "node"`
- **THEN** that declaration SHALL be resolvable once the transformation follows a reference into that document

#### Scenario: A subschema of an indexed document is transformed directly

- **WHEN** a context is built for a document and the transformation is then invoked on a subschema of that document
- **THEN** the resource owning that subschema SHALL be the outermost member of the dynamic scope
- **AND** anchors declared elsewhere in that resource SHALL be resolvable from it

#### Scenario: An unindexed schema is transformed without error

- **WHEN** the transformation is invoked on a schema object that the builder never indexed
- **THEN** the transformation SHALL treat that schema as rooting its own resource with no anchors
- **AND** it SHALL NOT throw for that reason alone
