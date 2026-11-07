# Design

## Context

See `proposal.md` for motivation and `specs/container-plan-inspection/spec.md` for the behavioral contract.

How plans work today (`@inversifyjs/core`, `src/planning/`):

- `plan(params)` returns a `PlanResult` whose `tree.root` is a `PlanServiceNode`. Service nodes hold `bindings`: a single `PlanBindingNode | undefined` for single requests, and an array for multiple requests. Binding nodes hold the `Binding`. Binding nodes that have children are:
  - `InstanceBindingNode`: `constructorParams` and `propertyParams`. Unmanaged constructor arguments become a `ConstructorNoParamNode`.
  - `ResolvedValueBindingNode`: `params`.
  - `PlanServiceRedirectionBindingNode`: `redirection`.
- **Service nodes do not carry their request constraints.** Name, tags, optional, multiplicity and chained live on the edge that requested them:
  - the root's `PlanParamsConstraint` / `GetPlanOptions`;
  - `ClassElementMetadata` for constructor arguments and properties;
  - `ResolvedValueElementMetadata` for resolved value arguments;
  - for redirections, the redirected request's `BuildServiceNodeOptions` with the target service identifier.

  Planning turns each edge into `BuildServiceNodeOptions` through `buildBuildServiceNodeOptionsFromClassElementMetadata`, `buildBuildServiceNodeOptionsFromResolvedValueElementMetadata` and `buildBuildServiceNodeOptionsFromPlanParamsConstraints`.
- **Nodes are shared.** Context-free subtrees are cached by `GetPlanOptions`, and later requests reuse them by reference (`currySubplan`, `cacheNonRootPlanServiceNode`). So a plan is a DAG, not a tree. After binding changes re-expand cached nodes, it can even contain a cycle.
- **Nodes are lazy and mutable.** Non-root service nodes are `LazyPlanServiceNode`s. They can be invalidated and are re-planned the next time `bindings` is read, and that re-planning can throw a planning error. Binding additions and removals mutate cached nodes in place (`add/removeServiceNodeBindingIfContextFree`).
- In `@inversifyjs/container`, `ServiceResolutionManager.#buildPlanResult` owns cache lookup, planning and `onPlan` notification for `get`/`getAll`. The plan cache key is `GetPlanOptions`. It supports at most one tag, while injection metadata supports many. A request with several tags is never cached and so never shared.

## Goals / Non-Goals

**Goals:**

- A small, stable, read-only public model that does not leak planning internals: no plan nodes, no raw `Binding` objects, no live metadata maps.
- Inspection derives constraints and walks the plan the same way planning and resolution do, so it cannot drift from what `get` actually does.
- Zero impact on the `get`/`getAll` hot path.
- Each building block is unit-testable in isolation, following the repository's testing guidelines.

**Non-Goals:**

- Dependencies acquired dynamically at resolution time, for example `context.get` inside dynamic values or factories. They are not part of the plan and are not inspected.
- Resolution-time state: singleton or request caches, activation and deactivation handlers, whether resolution would be async.
- Serialization or visualization helpers (`toJSON`, tree printing, DOT/Mermaid export). They can be layered on top of the model later.
- Reporting planning failures inside the inspection (see Decision 9).
- Exposing inspection through the plugin API (`PluginApi`). Plugins already receive the container and can call `inspectCurrentPlan`.
- Exposing internal caching flags such as `isContextFree`.

## Decisions

### 1. Snapshot, not a live view

`inspectCurrentPlan` eagerly walks the plan and returns a fully built object graph.

- **Why:** plan nodes mutate on binding changes and expand lazily, and lazy expansion can throw. A live facade would make reading a property throw planning errors at arbitrary later times, and it would change under the user while they traverse it. A snapshot fails fast (errors surface at the call, as with `get`), is stable, and matches the "current" in the method name.
- **Alternative considered:** lazy facade objects wrapping plan nodes, with getters reading through. Cheaper for partial traversal. Rejected because of the unstable and throwing semantics above, and because it would pin the public model to the lifetime of internal nodes.

### 2. Derive constraints from edges, reusing planning's own calculations

The internal walker operates on pairs `(PlanServiceNode, BuildServiceNodeOptions)`. Each service inspection's constraints come from the `BuildServiceNodeOptions` of the edge that reached it. Edges are converted with the existing `buildBuildServiceNodeOptionsFrom*` calculations, the same ones planning uses, so the two cannot drift:

- root: a new `buildBuildServiceNodeOptionsFromGetPlanOptions`, because the container already builds `GetPlanOptions` for the cache lookup;
- instance constructor arguments: zip `classMetadata.constructorArguments[i]` with `constructorParams[i]`;
- properties: zip `classMetadata.properties` with `propertyParams`;
- resolved value arguments: zip `binding.metadata.arguments[i]` with `params[i]`;
- redirections: the parent's options with `serviceIdentifier` replaced by `binding.targetServiceIdentifier`. This mirrors `curryBuildServiceRedirectionPlanBindingNode`.

**Alternative considered:** store constraints on `PlanServiceNode` during planning. Rejected. It adds memory and work to the planning hot path for a diagnostic feature, and shared nodes would still need an edge-based answer.

### 3. Public model: discriminated unions mirroring the domain

Service inspections are discriminated by `isMultiple`, which matches `GetPlanOptions` and the plan's own single/multiple split. Binding inspections are discriminated by `type`, using the public `BindingType` values. Sketch (all properties `readonly`):

```ts
interface PlanInspection {
  root: PlanServiceInspection;
}

type PlanServiceInspection =
  | SingleBindingPlanServiceInspection
  | MultipleBindingPlanServiceInspection;

interface BasePlanServiceInspection<TMultiple extends boolean> {
  isMultiple: TMultiple;
  name: MetadataName | undefined;
  optional: boolean;
  serviceIdentifier: ServiceIdentifier;
  tags: ReadonlyMap<MetadataTag, unknown>;
}

interface SingleBindingPlanServiceInspection extends BasePlanServiceInspection<false> {
  binding: PlanBindingInspection | undefined;
}

interface MultipleBindingPlanServiceInspection extends BasePlanServiceInspection<true> {
  bindings: readonly PlanBindingInspection[];
  chained: boolean;
}

type PlanBindingInspection =
  | ConstantValueBindingInspection
  | DynamicValueBindingInspection
  | FactoryBindingInspection
  | InstanceBindingInspection
  | ResolvedValueBindingInspection
  | ServiceRedirectionBindingInspection;

interface BaseBindingInspection<TType extends BindingType> {
  id: number;
  moduleId: number | undefined;
  serviceIdentifier: ServiceIdentifier;
  type: TType;
}

interface ScopedBindingInspection<TType extends BindingType, TScope extends BindingScope = BindingScope>
  extends BaseBindingInspection<TType> {
  scope: TScope;
}

// ConstantValue / Factory: ScopedBindingInspection<..., 'Singleton'>
// DynamicValue: ScopedBindingInspection<'DynamicValue'>

interface InstanceBindingInspection extends ScopedBindingInspection<'Instance'> {
  constructorArguments: readonly (PlanServiceInspection | undefined)[];
  implementationType: Newable;
  properties: ReadonlyMap<string | symbol, PlanServiceInspection>;
}

interface ResolvedValueBindingInspection extends ScopedBindingInspection<'ResolvedValue'> {
  arguments: readonly PlanServiceInspection[];
}

interface ServiceRedirectionBindingInspection extends BaseBindingInspection<'ServiceRedirection'> {
  redirection: PlanServiceInspection;
  targetServiceIdentifier: ServiceIdentifier;
}
```

- `tags` is a map in every inspection, including the root. The root's single `tag` becomes a one-entry map. This gives one uniform shape where injection metadata allows several tags.
- Naming follows existing public options: `name`, `optional`, `chained` and `isMultiple`, as in `GetOptions`, `GetAllOptions` and `GetPlanOptions`. Type names follow core's `*BindingNode` / `Plan*` conventions.
- **Alternative considered:** a single service shape that always has `bindings: PlanBindingInspection[]` plus an `isMultiple` flag. Rejected. It loses the guarantee that a single request has at most one binding, and it forces consumers to index `[0]`.

### 4. Never expose internals; copy live collections

Inspections expose plain data copied from bindings and metadata. Raw `Binding` objects are not exposed because they carry mutable `cache`, `isSatisfiedBy` and user callables. `tags` and `properties` are new `Map` instances, because metadata maps are live and shared across the whole container. Objects are not `Object.freeze`d: `readonly` types express the contract without the cost of freezing.

### 5. Unmanaged constructor arguments are `undefined` entries

`constructorArguments` keeps one entry per constructor argument, so indexes match the constructor signature. Unmanaged arguments are `undefined`, which mirrors how the container leaves them to the caller.

**Alternative considered:** an explicit `{ kind: 'unmanaged' }` entry. Rejected as surface area without information: there is nothing else to say about an unmanaged argument.

### 6. Identity-preserving, cycle-safe walk

Each call keeps a `Map<PlanServiceNode, PlanServiceInspection>`. A service inspection is registered in the map before its bindings are walked, then completed. As a result:

- shared plan nodes map to one inspection object, so the DAG shape is preserved and work is not duplicated;
- cycles close onto the in-progress ancestor instead of recursing forever.

Constraints of a shared node come from the first edge that reached it. This is sound because the plan only shares nodes through the cache, which is keyed by exactly those constraints (see Context).

Internally, builders create a mutable draft and return it typed as the public readonly interface.

### 7. Placement: model and builder in core, entry point in container

- **`@inversifyjs/core`**: new `src/inspection/` domain folder.
  - `models/`: the public types.
  - `calculations/`: the builders.
  - Public entry `inspectPlan(options: GetPlanOptions, planResult: PlanResult): PlanInspection`, exported next to `plan` and `resolve`.

  Core owns plan node shapes, so the knowledge of how to read them stays there.
- **`@inversifyjs/container`**:
  - `InspectCurrentPlanOptions` lives in container, next to `IsBoundOptions`, because only the container API uses it.
  - `ServiceResolutionManager.inspectCurrentPlan(serviceIdentifier, options)` reads `isMultiple` from the options, calls the existing `#buildPlanResult` and `#buildGetPlanOptions` with the remaining `GetOptions | GetAllOptions`, and passes the result to `inspectPlan`.
  - `Container.inspectCurrentPlan` delegates to it.
- **`inversify`**: re-exports the new types from both packages.

### 8. Break the service ↔ binding recursion by currying

The builders are split by responsibility:

- `buildPlanServiceInspection`: memoization and single/multiple handling;
- one builder per binding type with children (`buildInstanceBindingInspection`, `buildResolvedValueBindingInspection`, `buildServiceRedirectionBindingInspection`);
- a dispatcher `buildPlanBindingInspection` keyed on `binding.type`.

Binding builders receive the service-inspection builder as a parameter, which is the same technique `currySubplan` uses for planning. This avoids circular imports and lets each builder be unit-tested with `vitest.fn()` mocks.

**Alternative considered:** a single `PlanInspectionBuilder` class with private recursive methods. Simpler wiring, but it does not match the functional module style of `planning/` and makes per-unit tests coarse.

### 9. Same pipeline as resolution: cache, side effects and errors

Inspection goes through `#buildPlanResult`, which means:

- a cached plan is reused;
- a fresh plan is cached and `onPlan` handlers are notified exactly as for `get`;
- autobinding registers bindings exactly as for `get`;
- binding constraints (including user `when` predicates) are evaluated.

Planning errors propagate unchanged. This holds both for root planning errors and for errors raised while expanding lazy nodes during the walk, because resolution would expand those same nodes.

**Alternatives considered:**

- *Side-effect-free dry run:* planning mutates container state by design (autobinding, cache). A dry run would need a parallel planning mode, and the plan it produced could differ from the one `get` uses. That defeats "current plan".
- *Failure nodes in the inspection* (for example, an "unresolved" service inspection carrying the error): helpful for debugging, but planning stops at the first failure, so the plan does not exist to inspect past that point. Supporting this needs planning changes and a richer model. It can be added later as an opt-in. Adding a union variant would affect consumers with exhaustive switches, so it should be designed deliberately rather than bolted on.

### 10. Method shape

`inspectCurrentPlan(serviceIdentifier: ServiceIdentifier, options?: InspectCurrentPlanOptions): PlanInspection`. This mirrors the `get` contract. The options are discriminated by `isMultiple` (default `false`):

- `InspectCurrentSinglePlanOptions extends GetOptions`: adds `isMultiple?: false` and `chained?: never`;
- `InspectCurrentMultiplePlanOptions extends GetAllOptions`: adds `isMultiple: true`.

`chained?: never` is needed because TypeScript's excess property check on a union accepts any property known to some member. Without it, `{ name: 'x', chained: true }` would type-check as a single request and `chained` would be silently ignored.

Extending `GetOptions` and `GetAllOptions` keeps the inspection options in lockstep with resolution options: any future `get` option becomes available here automatically. It also makes the translation to `#buildPlanResult` one-to-one.

**Alternative considered:** a single request object that includes `serviceIdentifier`. Rejected in favor of matching `get`, which users already know.

## Risks / Trade-offs

- [Inspection expands every lazy node, so its cost is proportional to the plan size] → Acceptable for a diagnostic API. `get` does the same expansion on first resolution, and the expanded nodes are reused afterwards.
- [Shared-node constraints assume sharing only happens through the constraint-keyed plan cache] → Covered by a unit test that asserts first-edge constraints, plus an integration test for the shared dependency scenario. Any change to plan caching that breaks this shows up as a failing test.
- [The inspection graph can contain cycles, so naive recursive consumers such as `JSON.stringify` will fail] → Document it in the API docs. Cycles only appear for configurations that resolution itself cannot satisfy.
- [`Map` fields are not JSON-serializable] → Accepted for correctness and key fidelity (symbols, non-string tag keys). Serialization helpers are a non-goal.
- [Adding a binding type in future extends `PlanBindingInspection`] → Same evolution contract as the existing public `Binding` union. Release it with the same semver care.
- [Planning-time user code (`when` predicates) runs during inspection] → Same as `get`. Documented as "plans exactly as resolution would".

## Migration Plan

Purely additive. Ship as minor changesets for `@inversifyjs/core`, `@inversifyjs/container` and `inversify`. No rollback concerns beyond reverting the release.

## Open Questions

- Should a later iteration add serialization or pretty-printing helpers on top of the model (for example a `stringifyPlanInspection` utility)? This doesn't affect the model defined here.
