## Why

Resolution is on the hot path of every `container.get` call. Before this change, `resolve.ts` acted as a central dispatch hub: at resolution time it inspected each binding node's `binding.type`, performed a large `switch` statement, wired curried helpers together, and routed each node to the appropriate scope handler. This per-call overhead was measurable, particularly for transient-scoped services with deep dependency graphs.

There is a key insight that the old architecture could not exploit: the binding and its class metadata are both known at **planning** time, and they are immutable for the lifetime of the plan. That means all decisions about _how_ to resolve a node — which scope strategy to use, whether activations or post-construct methods can be skipped, whether properties need to be injected — can be made exactly once when the plan is built, not repeated on every resolution.

In particular, for `InstanceBinding` nodes the metadata exposes whether `@postConstruct` methods, property injections, or binding-level activations are registered. When none of those are present, the resolver can skip all those checks entirely. **Service-level activations (registered via `container.onActivation`) are independent of the binding** — they are keyed by service identifier, not by the binding itself — so they must always be checked at resolution time and cannot be statically optimised away. Every fast path therefore still calls `resolveBindingServiceActivations`.

Benchmarks show roughly **20% performance improvement** on transient services with deep dependency graphs.

## What Changes

- **Introduce `ResolvableBindingNode` interface.** All non-redirection binding nodes gain a `readonly resolve: (params: ResolutionParams) => Resolved<TActivated>` method. The resolver is built and wired once at planning time (inside the node's constructor), so resolution becomes a direct call to `node.resolve(params)`.
- **Add implementation classes for every non-redirection node type.**
  - `ConstantValueBindingNode` — wraps `resolveScoped` capturing the constant-value getter.
  - `DynamicValueBindingNode` — wraps `resolveScoped` capturing the dynamic-value call.
  - `FactoryBindingNodeImplementation` — wraps `resolveScoped` capturing the factory call.
  - `InstanceBindingNodeImplementation` — delegates to `buildInstanceBindingNodeResolver`, which selects the right resolver variant based on metadata.
  - `ResolvedValueBindingNodeImplementation` — wraps `resolveScoped` for resolved-value resolution.
- **Introduce `buildInstanceBindingNodeResolver`.** Inspects `classMetadata` and `binding` at plan time and returns either a fast-path resolver (`resolveScopedWithNoActivations`, which skips `resolveBindingActivations`) or the full resolver (`resolveScoped`) depending on whether post-construct methods, property injection, or binding-level activations are present.
- **Introduce `resolveScopedWithNoActivations`.** A variant of `resolveScoped` that omits the `resolveBindingActivations` wrapping. Used for `InstanceBinding` nodes that are known at plan time to have no binding-level activations or post-construct lifecycle hooks, while **always still calling `resolveBindingServiceActivations`** to handle container-registered service activations.
- **Decurry all resolution helpers.** `resolveInstanceBindingConstructorParams`, `resolveInstanceBindingNodeFromConstructorParams`, `resolveInstanceBindingNodeAsyncFromConstructorParams`, `setInstanceProperties`, `resolveResolvedValueBindingNode`, `resolveResolvedValueBindingParams`, and `resolveServiceRedirectionBindingNode` were previously produced via currying (accepting a resolver dependency and returning a configured function). They are now direct functions that import their dependencies statically. The currying was needed in the old architecture to break circular wiring inside `resolve.ts`; once each node carries its own resolver the circular dependency dissolves.
- **Extract service node dispatchers.** `resolveServiceNode`, `resolveSingleBindingServiceNode`, and `resolveMultipleBindingServiceNode` replace the inline binding-type dispatch that was previously inside `resolve.ts`. `resolveServiceNode` is the single entry point used by constructor-param and property-injection resolution.
- **Simplify `resolve.ts` radically.** The top-level resolution entry point is reduced to a three-line function that delegates entirely to `resolveServiceNode`.
- **Delete obsolete files.** `resolveConstantValueBinding.ts`, `resolveDynamicValueBinding.ts`, `resolveFactoryBinding.ts`, `resolveScopedBinding.ts`, `resolveScopedInstanceBindingNode.ts`, and `resolveScopedResolvedValueBindingNode.ts` are removed.
- **Update `PlanBindingNode`.** `FactoryBindingNode` is added as a union member (it was previously collapsed into `LeafBindingNode` without a `resolve` method).
- **`LeafBindingNode` gains the `TBinding` type parameter** so that the concrete binding type can be preserved through the interface.
- **Redirection nodes are intentionally left untouched.** `PlanServiceRedirectionBindingNode` does not gain a `resolve` method. Redirection nodes resolve by collecting values from potentially many redirected nodes; the 1-to-many semantics require special handling at the service-node level and are not a straightforward fit for the `ResolvableBindingNode` contract.

## Capabilities

_No new user-facing capabilities are introduced. This is a pure internal performance and structural improvement._

## Impact

- **Modified package**: `@inversifyjs/core` — major internal refactor. The public API is unchanged.
- **Changeset level**: `major` — `FactoryBindingNode` and `ResolvableBindingNode` are new public interfaces, and `InstanceBindingNode` / `LeafBindingNode` / `ResolvedValueBindingNode` gain new members; extending consumers may be affected.
- **Performance**: ~20% improvement on transient-scoped services with deep dependency graphs (benchmarked).
- **Tests**: `resolve.spec.ts` is removed (the logic it covered is now distributed across node-level and helper-level specs). `resolveScoped.spec.ts` and related specs are updated. New specs are added for `resolveServiceNode`, `resolveSingleBindingServiceNode`, `resolveMultipleBindingServiceNode`, and `resolveScopedWithNoActivations`.
