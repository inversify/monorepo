## Context

`@inversifyjs/core` is the DI container implementation. Every `container.get` call produces a **plan** (a tree of `PlanServiceNode`s, each containing a `PlanBindingNode`) and then **resolves** that plan.

Before this change the plan nodes were plain data objects — they held a `binding` reference but had no resolution logic of their own. All resolution decisions were made at resolve time inside `resolve.ts`, which:

1. Inspected `planBindingNode.binding.type` with a large `switch`.
2. Called the appropriate scope wrapper (singleton/request/transient) on every call.
3. Wired every dependency helper through currying, introducing multiple layers of function allocation per call.

A key property of binding nodes that the old architecture ignored: both the binding (including its `scope` and `onActivation`) and the class metadata (including `properties`, `lifecycle.postConstructMethodNames`) are **immutable once a node is created**. All branching that depends solely on these can be performed exactly once at plan time rather than repeated on every resolution call.

**Service activations vs binding activations.** There are two distinct activation systems:

- *Binding-level activations* (`binding.onActivation`) — stored on the binding object, known at plan time.
- *Service-level activations* (`container.onActivation(serviceId, handler)`) — registered against the container keyed by service identifier, can change between resolutions.

Because service-level activations are container-state and not plan-state, they must be checked at resolution time on every call. The fast path therefore still calls `resolveBindingServiceActivations`; it only skips the `resolveBindingActivations` wrapper (which handles both binding-level and service-level activations together).

**Redirection nodes.** `PlanServiceRedirectionBindingNode` describes a service alias that may resolve to multiple concrete bindings. Its 1-to-many semantics (the result is always `unknown[]`) are not compatible with the `ResolvableBindingNode` contract (`resolve(params) => Resolved<TActivated>`). Giving redirection nodes a `resolve` method would require special-casing in `resolveSingleBindingServiceNode` and `resolveMultipleBindingServiceNode` regardless, so redirection resolution is left in its dedicated `resolveServiceRedirectionBindingNode` helper and redirection nodes are intentionally excluded from the `ResolvableBindingNode` union.

## Goals / Non-Goals

**Goals:**
- Move all binding-type dispatch and scope-strategy selection from resolve time to plan time so each resolution call is a direct function invocation with no branching on binding type.
- Allow `InstanceBindingNode` to select a fast resolver (no activation wrapping) when it is statically known at plan time that neither binding-level activations nor post-construct methods nor property injection are present.
- Eliminate the currying chains in `resolve.ts` that were the only mechanism for breaking circular imports between planner and resolver.
- Reduce `resolve.ts` to a minimal entry point that delegates to `resolveServiceNode`.
- Delete all intermediate curried factories that no longer serve a purpose.

**Non-Goals:**
- Applying the same optimisation to `PlanServiceRedirectionBindingNode`. Redirection semantics are more complex and are deferred.
- Changing the public API or contracts of `container.get`, `container.getAll`, `container.getAsync`, `container.getAllAsync`.
- Caching plans across `container.get` calls (that is a separate concern).
- Modifying binding registration or metadata collection.

## Decisions

### 1. `ResolvableBindingNode` interface with a `resolve` method

**Decision**: Add

```typescript
export interface ResolvableBindingNode<
  TActivated = any,
  TBinding extends Binding<TActivated> = Binding<TActivated>,
> extends BaseBindingNode<TBinding> {
  readonly resolve: (params: ResolutionParams) => Resolved<TActivated>;
}
```

`LeafBindingNode`, `InstanceBindingNode`, `ResolvedValueBindingNode`, and the new `FactoryBindingNode` all extend this interface. The resolver is assigned in the constructor of each concrete implementation class and is never reassigned.

**Rationale**: Placing `resolve` on the node makes resolution O(1) per node: no type switch, no scope check, no function construction. All decisions are amortised over the plan's lifetime.

**Alternatives considered**:
- *Static resolver map keyed by binding id*: would require a Map lookup on every call and would not allow inline capture of node state.
- *Resolver on the binding object itself*: bindings are shared across plans and containers; attaching a resolver to a binding would complicate singleton semantics and make the binding mutable.

### 2. `FactoryBindingNode` as a separate interface

**Decision**: `FactoryBindingNode` is extracted as a distinct interface (separate from `LeafBindingNode`) and added as a member of the `PlanBindingNode` union.

**Rationale**: `FactoryBinding` is a `ScopedBinding` but not a `ConstantValueBinding` or `DynamicValueBinding`. The `LeafBindingNode` union conflated these types, requiring a `TActivated extends Factory<unknown>` conditional type. Making `FactoryBindingNode` a first-class interface simplifies the type algebra and makes the union exhaustive without conditionals.

### 3. `buildInstanceBindingNodeResolver`: two resolver paths for `InstanceBindingNode`

**Decision**: At node construction time, `buildInstanceBindingNodeResolver` inspects:

```typescript
classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
binding.onActivation === undefined &&
classMetadata.properties.size === 0
```

If all three are `true`, the node uses `resolveScopedWithNoActivations` wrapping `resolveInstanceBindingNodeFromOnlyConstructorParams` (which still calls `resolveBindingServiceActivations` for container-registered service activations). Otherwise, it uses `resolveScoped` wrapping the full `resolveInstanceBindingNodeFromConstructorParams`.

**Rationale**: The common case — a plain class with no lifecycle hooks, no property injection, and no binding-level activation — takes the fast path. The check is performed once; the selected resolver function is stored as a closure on the node and invoked directly on every subsequent resolution.

**Alternatives considered**:
- *Always use the full path*: safe, but leaves measurable performance on the table for the common case.
- *Check service activations at plan time too*: service activations are container-state (registered via `container.onActivation`) and are independent of the binding and plan, so they cannot be statically determined at plan time.

### 4. `resolveScopedWithNoActivations`: scope handling without `resolveBindingActivations`

**Decision**: Add a new function that mirrors `resolveScoped` but replaces `resolveBindingActivations(params, binding, resolve(params, node))` with a plain `resolve(params, node)`. This avoids the activation lookup for nodes that are statically known to have no binding-level activations.

**Rationale**: `resolveBindingActivations` checks both `binding.onActivation` and the container's service-activation registry on every call. For the fast path the binding-level activation check is redundant (already excluded by `buildInstanceBindingNodeResolver`), but the service-activation check cannot be eliminated because it is container-state. The fast-path resolvers (`resolveInstanceBindingNodeFromOnlyConstructorParams`, `resolveInstanceBindingNodeAsyncFromOnlyConstructorParams`) call `resolveBindingServiceActivations` directly so the service-level activation contract is preserved.

### 5. `resolveScoped` refactored to accept a node instead of a generic arg

**Decision**: Change the signature from

```typescript
resolveScoped(getBinding, resolve): (params, arg) => Resolved
```

to

```typescript
resolveScoped(node, resolve): (params) => Resolved
```

The binding is captured directly from `node.binding` at call time and the scope strategy (singleton/request/transient) is switched once, returning a pre-specialised function.

**Rationale**: The previous signature required passing the binding through a `getBinding` accessor on every resolution call. With the node passed at construction time the binding is captured in the closure; the scope switch executes once and returns the appropriate specialised function. This eliminates a function call and a property access on every resolution.

### 6. Decurrying all resolution helpers

**Decision**: `resolveInstanceBindingConstructorParams`, `resolveInstanceBindingNodeFromConstructorParams`, `resolveInstanceBindingNodeAsyncFromConstructorParams`, `setInstanceProperties`, `resolveResolvedValueBindingNode`, `resolveResolvedValueBindingParams`, and `resolveServiceRedirectionBindingNode` are converted from curried factories to plain functions that import their dependencies statically.

**Rationale**: The currying was introduced to break the circular dependency between `resolve.ts` (which wired everything) and the individual helpers (which needed `resolveServiceNode`). Once each binding node carries its own resolver, `resolve.ts` no longer needs to wire anything and the circular dependency dissolves. Plain functions with static imports are simpler, easier to tree-shake, and produce no extra closures at runtime.

### 7. Extracting `resolveServiceNode`, `resolveSingleBindingServiceNode`, `resolveMultipleBindingServiceNode`

**Decision**: Three new files replace the inline service-node dispatch previously embedded in `resolve.ts`.

- `resolveServiceNode` — decides between single and multiple bindings; returns `undefined` for optional services.
- `resolveSingleBindingServiceNode` — handles single-binding resolution; delegates to `resolveServiceRedirectionBindingNode` for redirection nodes, otherwise calls `binding.resolve(params)`.
- `resolveMultipleBindingServiceNode` — handles `getAll` resolution; same dispatch but collects into an array and promotes to `Promise.all` if any value is a promise.

**Rationale**: These are natural units of responsibility. Extracting them makes each function independently testable and keeps `resolve.ts` minimal.

### 8. Redirection nodes intentionally excluded

**Decision**: `PlanServiceRedirectionBindingNode` does not implement `ResolvableBindingNode` and is not modified.

**Rationale**: Redirection nodes are resolved by `resolveServiceRedirectionBindingNode`, which recursively expands redirections into a flat `unknown[]`. The resolution result is inherently multi-valued and the function signature is `(...) => unknown[]` rather than `(...) => Resolved<TActivated>`. Fitting this into `ResolvableBindingNode` would require either changing the interface to accommodate array results or wrapping the array in a single-element container — both options add complexity without meaningful gain. Applying the same optimisation to redirection nodes is deferred as a separate iteration.
