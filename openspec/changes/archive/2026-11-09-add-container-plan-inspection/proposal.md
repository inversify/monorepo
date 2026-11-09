# Proposal

## Why

Users can't see how the container would satisfy a request without resolving it. The plan (which bindings were picked, for which constraints, and what each binding depends on) is only reachable through internal planning structures. Those structures are mutable, lazily expanded, shared across plans, and coupled to caching and resolution internals. Users debugging "why did I get this implementation?" or "what does resolving `X` pull in?" need a stable, read-only view of the plan that does not instantiate anything.

## What Changes

- Add a `Container.inspectCurrentPlan(serviceIdentifier, options?): PlanInspection` method that mirrors the `get` contract. Its options extend `GetOptions` (`name`, `tag`, `optional`, `autobind`) with `isMultiple`. When `isMultiple` is `true`, they extend `GetAllOptions` (adding `chained`).
- Add a public, read-only inspection model (a facade over the plan):
  - `PlanInspection` exposes `root: PlanServiceInspection`.
  - `PlanServiceInspection` describes one service request: service identifier, name, tags, optional flag, multiplicity (and `chained` for multiple requests). It also exposes the binding inspection(s) that satisfy the request.
  - `PlanBindingInspection` is a union discriminated by binding `type`. Each variant exposes its binding id, module id, service identifier and scope where applicable. Bindings that have planned dependencies expose them as service inspections:
    - instance bindings expose constructor arguments and properties;
    - resolved value bindings expose their arguments;
    - service redirection bindings expose their redirection.
- The inspection is a snapshot of the plan the container would use for `get`/`getAll` at call time. It is planned (or reused from cache) exactly as resolution would. No service is instantiated and no activation runs.
- Planning failures (no matching binding, ambiguous bindings, maximum plan depth exceeded) throw the same errors `get`/`getAll` would throw.
- No breaking changes. Existing public types and behaviors are unchanged.

## Capabilities

### New Capabilities

- `container-plan-inspection`: Read-only inspection of the dependency resolution plan the container would use for a given request, including request constraints (name, tags, optionality, multiplicity), selected bindings, and their planned dependencies.

### Modified Capabilities

None.

## Impact

- `@inversifyjs/core` (minor): new public inspection model types and a function that builds a `PlanInspection` from a plan result. Planning and resolution code paths are unchanged.
- `@inversifyjs/container` (minor): new `Container.inspectCurrentPlan` method and `InspectCurrentPlanOptions` types. `ServiceResolutionManager` gains an inspection entry point that reuses its existing plan building and caching.
- `inversify` (minor): re-exports the new public types.
- Documentation: new `inspectCurrentPlan` section in the container API docs (`packages/docs/services/inversify-site/docs/api/container.mdx`) with a v8 code example in `@inversifyjs/code-examples`.
- Performance: no impact on `get`/`getAll`. Inspection walks the whole plan, so its cost is proportional to the plan size. That is acceptable because it is a diagnostic API, not a hot path.
