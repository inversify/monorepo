# Tasks

Paths below are relative to `packages/container/libraries/` unless stated otherwise. Unit tests follow `docs/testing/unit-testing.md` (four-layer describe, `vitest.mock` for module dependencies) and `docs/testing/fixtures.md`.

## 1. Core inspection model

- [x] 1.1 Add the public inspection types from design Decision 3 under `core/src/inspection/models/`, one file per type:
  - `PlanInspection`
  - `PlanServiceInspection`, `BasePlanServiceInspection`, `SingleBindingPlanServiceInspection`, `MultipleBindingPlanServiceInspection`
  - `PlanBindingInspection`, `BaseBindingInspection`, `ScopedBindingInspection`
  - `ConstantValueBindingInspection`, `DynamicValueBindingInspection`, `FactoryBindingInspection`, `InstanceBindingInspection`, `ResolvedValueBindingInspection`, `ServiceRedirectionBindingInspection`

  Verify with `pnpm run --filter "@inversifyjs/core" build`.
- [x] 1.2 Add type tests in `core/src/inspection/models/PlanServiceInspection.spec-d.ts` and `core/src/inspection/models/PlanBindingInspection.spec-d.ts`. They assert that narrowing on `isMultiple` exposes `binding` or `bindings` + `chained`, that narrowing on `type` exposes the per-variant fields, and that `ServiceRedirection` has no `scope`. Verify with `pnpm run --filter "@inversifyjs/core" test`.

## 2. Core inspection builders

- [x] 2.1 Add `buildBuildServiceNodeOptionsFromGetPlanOptions` in `core/src/common/calculations/`. It converts the single optional `tag` into a `tags` map and preserves `isMultiple`, `chained`, `name`, `optional` and `serviceIdentifier`. Add its `.spec.ts` covering single/multiple and with/without tag, and verify it passes.
- [x] 2.2 Add `curryBuildPlanServiceInspection(buildPlanBindingInspection)` in `core/src/inspection/calculations/`. The built function takes `(serviceInspections, serviceNode, options)`, where `serviceInspections` is the per-call `Map<PlanServiceNode, PlanServiceInspection>`. It does the following:
  - returns the memoized inspection when present;
  - otherwise registers a draft before walking bindings (Decision 6);
  - copies `tags`;
  - maps `bindings` to `binding` or `bindings` according to `options.isMultiple`.

  Unit-test these flows and verify they pass: memo hit, single with a binding, single without a binding, multiple, and a cycle (a draft returned on re-entry).
- [x] 2.3 Add `buildInstanceBindingInspection`. It zips `classMetadata.constructorArguments` with `constructorParams` (`undefined` for unmanaged) and `classMetadata.properties` with `propertyParams`, uses `buildBuildServiceNodeOptionsFromClassElementMetadata` for each edge, and recurses through the injected service builder. Unit-test the managed, unmanaged and property flows and verify they pass.
- [x] 2.4 Add `buildResolvedValueBindingInspection`. It zips `binding.metadata.arguments` with `params` via `buildBuildServiceNodeOptionsFromResolvedValueElementMetadata`. Unit-test it and verify it passes.
- [x] 2.5 Add `buildServiceRedirectionBindingInspection`. It recurses into `redirection` with the parent options and `serviceIdentifier` set to `targetServiceIdentifier`. Unit-test that the name, tags, optional and multiplicity are inherited, and verify it passes.
- [x] 2.6 Add `curryBuildPlanBindingInspection(buildPlanServiceInspection)`, which dispatches on `binding.type`. Leaf types (`ConstantValue`, `DynamicValue`, `Factory`) go through a shared `buildScopedBindingInspection` (identity and scope only, also reused by instance and resolved value builders), and never read `value`, `factory` or any other callable. Unit-test every binding type and verify it passes.
- [x] 2.7 Add the public entry `inspectPlan(options: GetPlanOptions, planResult: PlanResult): PlanInspection` in `core/src/inspection/actions/inspectPlan.ts`. It wires the curried builders once at module level, mirroring `planning/actions/plan.ts`. Errors thrown while walking are passed through `handleResolveError`, so circular-dependency errors read exactly as they do for `get`. `handleResolveError` takes the `PlanResult` and the error directly. Unit-test the delegation and the error path, and verify they pass.
- [x] 2.8 Add `core/src/inspection/actions/inspectPlan.int.spec.ts`, which builds real plans with `plan()`. Cover these cases and verify they pass:
  - a diamond dependency with a shared context-free node (same object reached twice);
  - a hand-built cyclic node graph (terminates, and the cycle closes on the ancestor object);
  - a lazy node that was invalidated (expanded during the walk);
  - a lazy node whose expansion fails (the planning error propagates).
- [x] 2.9 Export `inspectPlan` and all the new public types from `core/src/index.ts`, and verify with `pnpm run --filter "@inversifyjs/core" build` and `pnpm run --filter "@inversifyjs/core" lint`.

## 3. Container API

- [x] 3.1 Add `InspectCurrentPlanOptions`, `InspectCurrentSinglePlanOptions` and `InspectCurrentMultiplePlanOptions` in `container/src/container/models/InspectCurrentPlanOptions.ts`. They extend `GetOptions` / `GetAllOptions` per Decision 10. Add a `.spec-d.ts` asserting that `chained` is rejected unless `isMultiple: true`, and verify it passes.
- [x] 3.2 Add `ServiceResolutionManager.inspectCurrentPlan(serviceIdentifier, options)`. It passes `isMultiple` (default `false`), `serviceIdentifier` and the options to the existing `#buildPlanResult` and `#buildGetPlanOptions`, then returns `inspectPlan(getPlanOptions, planResult)`. Leave `get`/`getAll` code paths untouched. Extend `ServiceResolutionManager.spec.ts` (cache hit, cache miss with `onPlan` notification, single/multiple mapping) and verify it passes.
- [x] 3.3 Add `Container.inspectCurrentPlan(serviceIdentifier, options?): PlanInspection`, delegating to `ServiceResolutionManager`. Extend `Container.spec.ts` and verify it passes.
- [x] 3.4 Add `Container.int.spec.ts` cases covering every scenario in `specs/container-plan-inspection/spec.md`:
  - constraints on the root and on dependencies;
  - optional and empty requests;
  - every binding type, unmanaged arguments, resolved value arguments, redirections;
  - context-dependent `whenParentIs`;
  - no instantiation, no activation and no dynamic value evaluation;
  - `onPlan` counted once across inspect + `get`;
  - parent container bindings;
  - planning errors equal to `get`/`getAll` errors;
  - snapshot stability after `rebind`;
  - shared dependency identity.

  Verify with `pnpm run --filter "@inversifyjs/container" test`.
- [x] 3.5 Export the options types from `container/src/index.ts`. Re-export the options types and the core inspection types from `inversify/src/index.ts`. Verify with `pnpm run --filter "@inversifyjs/container" build` and `pnpm run --filter "inversify" build`.

## 4. Documentation and release

> 4.1 and 4.2 are blocked until release: the v8 examples compile against the published `inversify8` alias (`npm:inversify@8.2.3`), which has no `inspectCurrentPlan`. Do them in a follow-up once that alias is bumped to the release that ships this change.

- [ ] 4.1 Add a `containerApiInspectCurrentPlan.ts` example with its `containerApiInspectCurrentPlan.int.spec.ts` in `packages/docs/tools/inversify-code-examples/src/examples/v8/`. The example should show a class with a named dependency, inspect it, and read `root.binding.constructorArguments[0]`. Verify with `pnpm run --filter "@inversifyjs/code-examples" test`.
- [ ] 4.2 Add an `## inspectCurrentPlan` section and an `## InspectCurrentPlanOptions` section to `packages/docs/services/inversify-site/docs/api/container.mdx`. Embed the example and note the following:
  - snapshot semantics;
  - no resolution side effects, but planning side effects (cache, `onPlan`, autobind, `when` predicates);
  - errors equal to `get`/`getAll`;
  - dynamic dependencies are not inspected;
  - the graph may be cyclic.

  Verify that the docs site builds.
- [x] 4.3 Add a changeset with minor bumps for `@inversifyjs/core`, `@inversifyjs/container` and `inversify`, describing `container.inspectCurrentPlan` and the inspection model. Verify that the file is present in `.changeset/`.

## 5. Integration checks

- [x] 5.1 Run `pnpm run build`, `pnpm run lint` and `pnpm run test` at the repository root and verify they pass.
- [x] 5.2 Run `pnpm run unused` (knip) and verify that no new unused exports or dependencies are reported.
- [x] 5.3 Run the container benchmarks and verify that `get`/`getAll` show no regression compared with the base branch.
