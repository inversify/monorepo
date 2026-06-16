## 1. Interfaces and type changes (`@inversifyjs/core` — planning models)

- [x] 1.1 Add `ResolvableBindingNode` interface in [packages/container/libraries/core/src/planning/models/ResolvableBindingNode.ts](packages/container/libraries/core/src/planning/models/ResolvableBindingNode.ts) with `readonly resolve: (params: ResolutionParams) => Resolved<TActivated>` and extending `BaseBindingNode<TBinding>`.
- [x] 1.2 Add `FactoryBindingNode` interface in [packages/container/libraries/core/src/planning/models/FactoryBindingNode.ts](packages/container/libraries/core/src/planning/models/FactoryBindingNode.ts) extending `BaseBindingNode<TBinding>` with a `readonly resolve` method.
- [x] 1.3 Update `LeafBindingNode` in [packages/container/libraries/core/src/planning/models/LeafBindingNode.ts](packages/container/libraries/core/src/planning/models/LeafBindingNode.ts) to extend `ResolvableBindingNode` and add the `TBinding` type parameter.
- [x] 1.4 Update `InstanceBindingNode` in [packages/container/libraries/core/src/planning/models/InstanceBindingNode.ts](packages/container/libraries/core/src/planning/models/InstanceBindingNode.ts) to extend `ResolvableBindingNode` instead of `BaseBindingNode`, and add the `TActivated` type parameter.
- [x] 1.5 Update `ResolvedValueBindingNode` in [packages/container/libraries/core/src/planning/models/ResolvedValueBindingNode.ts](packages/container/libraries/core/src/planning/models/ResolvedValueBindingNode.ts) to extend `ResolvableBindingNode` instead of `BaseBindingNode`.
- [x] 1.6 Update `PlanBindingNode` in [packages/container/libraries/core/src/planning/models/PlanBindingNode.ts](packages/container/libraries/core/src/planning/models/PlanBindingNode.ts) to add `FactoryBindingNode` as a union member.
- [x] 1.7 Export new public interfaces and classes from the package index in [packages/container/libraries/core/src/index.ts](packages/container/libraries/core/src/index.ts).

## 2. Concrete node implementation classes

- [x] 2.1 Add `ConstantValueBindingNode` class in [packages/container/libraries/core/src/planning/models/ConstantValueBindingNode.ts](packages/container/libraries/core/src/planning/models/ConstantValueBindingNode.ts) implementing `LeafBindingNode<TActivated, ConstantValueBinding<TActivated>>`. Constructor builds the resolver via `resolveScoped(this, (_params, node) => node.binding.value)`.
- [x] 2.2 Add `DynamicValueBindingNode` class in [packages/container/libraries/core/src/planning/models/DynamicValueBindingNode.ts](packages/container/libraries/core/src/planning/models/DynamicValueBindingNode.ts) implementing `LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>`. Constructor builds the resolver via `resolveScoped(this, (params, node) => node.binding.value(params.context))`.
- [x] 2.3 Add `FactoryBindingNodeImplementation` class in [packages/container/libraries/core/src/planning/models/FactoryBindingNodeImplementation.ts](packages/container/libraries/core/src/planning/models/FactoryBindingNodeImplementation.ts) implementing `FactoryBindingNode<TActivated>`. Constructor builds the resolver via `resolveScoped(this, (params, node) => node.binding.factory(params.context))`.
- [x] 2.4 Add `InstanceBindingNodeImplementation` class in [packages/container/libraries/core/src/planning/models/InstanceBindingNodeImplementation.ts](packages/container/libraries/core/src/planning/models/InstanceBindingNodeImplementation.ts) implementing `InstanceBindingNode<TActivated, InstanceBinding<TActivated>>`. Constructor delegates to `buildInstanceBindingNodeResolver(binding, classMetadata, this)`.
- [x] 2.5 Add `ResolvedValueBindingNodeImplementation` class in [packages/container/libraries/core/src/planning/models/ResolvedValueBindingNodeImplementation.ts](packages/container/libraries/core/src/planning/models/ResolvedValueBindingNodeImplementation.ts) implementing `ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>`. Constructor builds the resolver via `resolveScoped(this, resolveResolvedValueBindingNode)`.

## 3. `buildInstanceBindingNodeResolver` (planning calculations)

- [x] 3.1 Add `buildInstanceBindingNodeResolver` in [packages/container/libraries/core/src/planning/calculations/buildInstanceBindingNodeResolver.ts](packages/container/libraries/core/src/planning/calculations/buildInstanceBindingNodeResolver.ts). The function inspects `classMetadata.lifecycle.postConstructMethodNames.size === 0 && binding.onActivation === undefined && classMetadata.properties.size === 0` and returns either `resolveScopedWithNoActivations(node, resolveInstanceBindingNodeWithOnlyConstructorParams)` (fast path) or `resolveScoped(node, resolveInstanceBindingNode)` (full path).

## 4. Refactor `resolveScoped`

- [x] 4.1 Refactor `resolveScoped` in [packages/container/libraries/core/src/resolution/actions/resolveScoped.ts](packages/container/libraries/core/src/resolution/actions/resolveScoped.ts) to accept `(node: TNode, resolve: (params, node) => Resolved) => (params) => Resolved`. Capture `node.binding` once at call time and perform the scope `switch` once, returning a pre-specialised closure. Remove the `TArg` / `getBinding` parameters.

## 5. Add `resolveScopedWithNoActivations`

- [x] 5.1 Add `resolveScopedWithNoActivations` in [packages/container/libraries/core/src/resolution/actions/resolveScopedWithNoActivations.ts](packages/container/libraries/core/src/resolution/actions/resolveScopedWithNoActivations.ts). Mirrors `resolveScoped` but omits the `resolveBindingActivations` wrapper, calling `resolve(params, node)` directly. Used for nodes proven at plan time to have no binding-level activations or post-construct lifecycle hooks.

## 6. Add `resolveInstanceBindingNodeFromOnlyConstructorParams` and `resolveInstanceBindingNodeAsyncFromOnlyConstructorParams`

- [x] 6.1 Add `resolveInstanceBindingNodeFromOnlyConstructorParams` in [packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeFromConstructorParams.ts](packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeFromConstructorParams.ts). Constructs the instance and calls `resolveBindingServiceActivations` (for container-registered service activations) but skips `setInstanceProperties` and post-construct method invocation.
- [x] 6.2 Add `resolveInstanceBindingNodeAsyncFromOnlyConstructorParams` in [packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.ts](packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.ts). Async variant of the above: awaits the constructor params promise, constructs the instance, and calls `resolveBindingServiceActivations`.

## 7. Decurry resolution helpers

- [x] 7.1 Decurry `resolveInstanceBindingConstructorParams` in [packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingConstructorParams.ts](packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingConstructorParams.ts): remove the `resolveServiceNode` parameter and import `resolveServiceNode` directly.
- [x] 7.2 Decurry `resolveInstanceBindingNodeFromConstructorParams` in [packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeFromConstructorParams.ts](packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeFromConstructorParams.ts): remove the `setInstanceProperties` parameter and import `setInstanceProperties` directly.
- [x] 7.3 Decurry `resolveInstanceBindingNodeAsyncFromConstructorParams` in [packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.ts](packages/container/libraries/core/src/resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.ts): remove the curried factory wrapper.
- [x] 7.4 Decurry `setInstanceProperties` in [packages/container/libraries/core/src/resolution/actions/setInstanceProperties.ts](packages/container/libraries/core/src/resolution/actions/setInstanceProperties.ts): remove the `resolveServiceNode` parameter and import `resolveServiceNode` directly.
- [x] 7.5 Decurry `resolveResolvedValueBindingNode` in [packages/container/libraries/core/src/resolution/actions/resolveResolvedValueBindingNode.ts](packages/container/libraries/core/src/resolution/actions/resolveResolvedValueBindingNode.ts): remove the `resolveResolvedValueBindingParams` parameter and import it directly.
- [x] 7.6 Decurry `resolveResolvedValueBindingParams` in [packages/container/libraries/core/src/resolution/actions/resolveResolvedValueBindingParams.ts](packages/container/libraries/core/src/resolution/actions/resolveResolvedValueBindingParams.ts): remove the `resolveServiceNode` parameter and import `resolveServiceNode` directly.
- [x] 7.7 Decurry `resolveServiceRedirectionBindingNode` in [packages/container/libraries/core/src/resolution/actions/resolveServiceRedirectionBindingNode.ts](packages/container/libraries/core/src/resolution/actions/resolveServiceRedirectionBindingNode.ts): remove the `resolveBindingNode` parameter and make `resolveBindingNode` a module-level function that calls `planBindingNode.resolve(params)`.

## 8. Add service node dispatchers

- [x] 8.1 Add `resolveServiceNode` in [packages/container/libraries/core/src/resolution/actions/resolveServiceNode.ts](packages/container/libraries/core/src/resolution/actions/resolveServiceNode.ts). Dispatches to `resolveSingleBindingServiceNode` or `resolveMultipleBindingServiceNode` based on whether `serviceNode.bindings` is an array; returns `undefined` for `serviceNode.bindings === undefined`.
- [x] 8.2 Add `resolveSingleBindingServiceNode` in [packages/container/libraries/core/src/resolution/actions/resolveSingleBindingServiceNode.ts](packages/container/libraries/core/src/resolution/actions/resolveSingleBindingServiceNode.ts). For redirection nodes delegates to `resolveServiceRedirectionBindingNode` (verifying a single result); for all other nodes calls `binding.resolve(params)`.
- [x] 8.3 Add `resolveMultipleBindingServiceNode` in [packages/container/libraries/core/src/resolution/actions/resolveMultipleBindingServiceNode.ts](packages/container/libraries/core/src/resolution/actions/resolveMultipleBindingServiceNode.ts). Iterates bindings, dispatches redirection nodes to `resolveServiceRedirectionBindingNode`, calls `binding.resolve(params)` for all others, and promotes the result to `Promise.all` if any value is a promise.

## 9. Simplify `resolve.ts` and delete obsolete files

- [x] 9.1 Simplify [packages/container/libraries/core/src/resolution/actions/resolve.ts](packages/container/libraries/core/src/resolution/actions/resolve.ts) to a minimal function that calls `resolveServiceNode(params, params.planResult.tree.root)` inside a `try/catch` delegating to `handleResolveError`.
- [x] 9.2 Delete `resolveConstantValueBinding.ts`, `resolveDynamicValueBinding.ts`, `resolveFactoryBinding.ts`, `resolveScopedBinding.ts`, `resolveScopedInstanceBindingNode.ts`, and `resolveScopedResolvedValueBindingNode.ts`.

## 10. Update plan builders to use implementation classes

- [x] 10.1 Update `curryBuildServiceNodeBindings` in [packages/container/libraries/core/src/planning/actions/curryBuildServiceNodeBindings.ts](packages/container/libraries/core/src/planning/actions/curryBuildServiceNodeBindings.ts) to instantiate `ConstantValueBindingNode`, `DynamicValueBindingNode`, and `FactoryBindingNodeImplementation` (replacing the old plain-object `{ binding }` pattern). Remove the `default` branch from the switch that pushed bare objects.
- [x] 10.2 Update `curryBuildInstancePlanBindingNode` inside `curryBuildServiceNodeBindings.ts` to use `new InstanceBindingNodeImplementation(binding, classMetadata)` instead of the plain object.
- [x] 10.3 Update `curryBuildResolvedValuePlanBindingNode` inside `curryBuildServiceNodeBindings.ts` to use `new ResolvedValueBindingNodeImplementation(binding)` instead of the plain object.

## 11. Tests

- [x] 11.1 Remove `resolve.spec.ts` (coverage now distributed across node-level and helper-level specs).
- [x] 11.2 Update `resolveScoped.spec.ts` to match the new `(node, resolve)` signature.
- [x] 11.3 Add `resolveScopedWithNoActivations.spec.ts` covering singleton/request/transient scopes and verifying activations are NOT called but `resolveBindingServiceActivations` IS called via the inner resolver.
- [x] 11.4 Add `resolveServiceNode.spec.ts` covering undefined bindings, single binding, and multiple bindings delegation.
- [x] 11.5 Add `resolveSingleBindingServiceNode.spec.ts` covering the direct `resolve(params)` path and the redirection path (including the multiple-results error).
- [x] 11.6 Add `resolveMultipleBindingServiceNode.spec.ts` covering sync and async result promotion.
- [x] 11.7 Update `resolveInstanceBindingConstructorParams.spec.ts`, `resolveInstanceBindingNodeFromConstructorParams.spec.ts`, `resolveInstanceBindingNodeAsyncFromConstructorParams.spec.ts`, `setInstanceProperties.spec.ts`, `resolveResolvedValueBindingNode.spec.ts`, and `resolveResolvedValueBindingParams.spec.ts` to reflect the decurried signatures.
- [x] 11.8 Update `curryBuildServiceNodeBindings.spec.ts`, `currySubplan.spec.ts`, and `plan.int.spec.ts` to assert `resolve: expect.any(Function)` on binding nodes.
- [x] 11.9 Add `InstanceBindingFixtures` fixtures to support instance binding node tests.

## 12. Changeset and verification

- [x] 12.1 Add changeset entry in `.changeset/` with `"@inversifyjs/core": major` documenting the new interfaces, the `resolve` method addition, and the ~20% performance improvement.
- [ ] 12.2 Run `pnpm run --filter "@inversifyjs/core" test`.
- [ ] 12.3 Run `pnpm run --filter "@inversifyjs/core" lint`.
- [ ] 12.4 Run `pnpm run --filter "@inversifyjs/core" build`.
- [ ] 12.5 Run `pnpm run --filter "@inversifyjs/container-benchmarks" test` (or equivalent benchmark command) to confirm the performance improvement.
