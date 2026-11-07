# Spec Delta

## Purpose

Let users inspect, without resolving anything, the dependency resolution plan the container would use for a request: the request constraints, the bindings selected to satisfy it, and the dependencies those bindings plan for.

## ADDED Requirements

### Requirement: Container exposes the current plan for a request

The container SHALL provide `inspectCurrentPlan(serviceIdentifier, options?)`, mirroring `get`. The options SHALL accept every `get` option (`name`, `tag`, `optional`, `autobind`) plus `isMultiple`. When `isMultiple` is `true`, they SHALL also accept every `getAll` option (`chained`). It SHALL return a plan inspection whose `root` describes the request. Omitting `options` or `isMultiple` SHALL be equivalent to `isMultiple: false`.

#### Scenario: Inspecting a single service request

- **GIVEN** a container where service `Weapon` is bound to class `Katana`
- **WHEN** `inspectCurrentPlan(Weapon)` is called
- **THEN** `root.serviceIdentifier` is `Weapon`
- **AND** `root.isMultiple` is `false`
- **AND** `root.binding` describes an instance binding whose implementation type is `Katana`

#### Scenario: Inspecting a multiple service request

- **GIVEN** a container where service `Weapon` is bound to classes `Katana` and `Shuriken`, in that order
- **WHEN** `inspectCurrentPlan(Weapon, { isMultiple: true })` is called
- **THEN** `root.isMultiple` is `true`
- **AND** `root.bindings` contains two binding inspections, for `Katana` and for `Shuriken`, in that order

### Requirement: Service inspections expose the request constraints

Every service inspection SHALL expose the constraints under which its service was requested: `serviceIdentifier`, `name` (or `undefined`), `tags` (a map of tag key to value, empty when untagged), `optional`, `isMultiple` and, for multiple requests, `chained`. The root's constraints come from the inspected request. Each dependency's constraints come from its injection metadata.

#### Scenario: Root request constraints are reflected

- **WHEN** `inspectCurrentPlan(Weapon, { isMultiple: true, chained: true, name: 'melee', optional: true, tag: { key: 'kind', value: 'sharp' } })` is called on a container with matching bindings
- **THEN** `root.name` is `'melee'`
- **AND** `root.tags` contains exactly the entry `'kind' -> 'sharp'`
- **AND** `root.optional` is `true`
- **AND** `root.isMultiple` is `true`
- **AND** `root.chained` is `true`

#### Scenario: Dependency constraints reflect injection metadata

- **GIVEN** a class `Ninja` whose first constructor argument is decorated with `@inject(Weapon)`, `@named('melee')`, `@tagged('kind', 'sharp')`, `@tagged('size', 'small')` and `@optional()`
- **AND** a container where `Ninja` is bound to itself and a matching `Weapon` binding exists
- **WHEN** the plan for `Ninja` is inspected
- **THEN** the service inspection of that constructor argument has `serviceIdentifier` `Weapon`, `name` `'melee'`, `optional` `true`, `isMultiple` `false`
- **AND** its `tags` contain exactly `'kind' -> 'sharp'` and `'size' -> 'small'`

#### Scenario: Multi-injected dependency constraints

- **GIVEN** a class whose property is decorated with `@multiInject(Weapon, { chained: true })`
- **WHEN** the plan for that class is inspected
- **THEN** the property's service inspection has `isMultiple` `true` and `chained` `true`

### Requirement: Service inspections expose the selected bindings

A single service inspection SHALL expose `binding`: the binding selected for the request, or `undefined` when the request is optional and no binding matches. A multiple service inspection SHALL expose `bindings`: every matching binding in the order the container would resolve them, possibly empty.

#### Scenario: Optional single request without bindings

- **GIVEN** a container with no binding for `Weapon`
- **WHEN** `inspectCurrentPlan(Weapon, { optional: true })` is called
- **THEN** `root.binding` is `undefined`

#### Scenario: Optional multiple request without bindings

- **GIVEN** a container with no binding for `Weapon`
- **WHEN** `inspectCurrentPlan(Weapon, { isMultiple: true, optional: true })` is called
- **THEN** `root.bindings` is empty

#### Scenario: Only bindings satisfying the constraints are selected

- **GIVEN** `Weapon` bound to `Katana` named `'melee'` and to `Bow` named `'ranged'`
- **WHEN** `inspectCurrentPlan(Weapon, { name: 'ranged' })` is called
- **THEN** `root.binding` describes the binding to `Bow`

### Requirement: Binding inspections identify the binding

Every binding inspection SHALL expose the binding's `id`, `moduleId` (or `undefined` when not bound from a container module), `serviceIdentifier` and `type`. The `type` SHALL be one of `ConstantValue`, `DynamicValue`, `Factory`, `Instance`, `ResolvedValue`, `ServiceRedirection`. Every binding type except `ServiceRedirection` SHALL also expose `scope`. Binding inspections SHALL NOT expose bound values, factories or other callables.

#### Scenario: Binding identity matches the binding identifier

- **GIVEN** a binding for `Weapon` whose identifier is obtained through the binding syntax `getIdentifier()`
- **WHEN** the plan for `Weapon` is inspected
- **THEN** `root.binding.id` equals that identifier's `id`

#### Scenario: Scoped binding exposes its scope

- **GIVEN** `Weapon` bound to `Katana` in singleton scope
- **WHEN** the plan for `Weapon` is inspected
- **THEN** `root.binding.type` is `Instance` and `root.binding.scope` is `Singleton`

#### Scenario: Module-bound binding exposes its module id

- **GIVEN** `Weapon` bound inside a loaded container module
- **WHEN** the plan for `Weapon` is inspected
- **THEN** `root.binding.moduleId` equals that container module's id

#### Scenario: Leaf bindings expose no dependencies

- **GIVEN** `Weapon` bound to a constant value, a dynamic value or a factory
- **WHEN** the plan for `Weapon` is inspected
- **THEN** the binding inspection exposes identity, type and scope only, with no dependency inspections

### Requirement: Instance binding inspections expose their planned dependencies

An instance binding inspection SHALL expose `implementationType`. It SHALL also expose `constructorArguments` with one entry per constructor argument, in order. A managed argument's entry is its service inspection; an unmanaged argument's entry is `undefined`. It SHALL expose `properties`: a map from property key to service inspection containing every managed injected property and no others.

#### Scenario: Constructor and property dependencies are inspected

- **GIVEN** class `Ninja` with constructor arguments `@inject(Weapon)` and `@unmanaged()`, and a property `shuriken` decorated with `@inject(ThrowableWeapon)`
- **WHEN** the plan for `Ninja` is inspected
- **THEN** `constructorArguments` has length 2
- **AND** its first entry is a service inspection for `Weapon` with its selected binding
- **AND** its second entry is `undefined`
- **AND** `properties` contains exactly the key `shuriken`, mapped to a service inspection for `ThrowableWeapon`

#### Scenario: Dependencies are inspected transitively

- **GIVEN** `Ninja` injects `Weapon`, and `Weapon` is bound to `Katana`, which injects `Blade`
- **WHEN** the plan for `Ninja` is inspected
- **THEN** the inspection of `Ninja`'s `Weapon` argument exposes the `Katana` binding, whose `constructorArguments` include a service inspection for `Blade`

### Requirement: Resolved value binding inspections expose their planned arguments

A resolved value binding inspection SHALL expose `arguments`: one service inspection per injected argument of the resolved value, in declaration order. Each carries the constraints declared for that argument.

#### Scenario: Resolved value arguments are inspected

- **GIVEN** `Warrior` bound with `toResolvedValue(factory, [Weapon, { isMultiple: true, serviceIdentifier: Shield }])`
- **WHEN** the plan for `Warrior` is inspected
- **THEN** the binding inspection's `arguments` has two entries: a single request for `Weapon` and a multiple request for `Shield`

### Requirement: Service redirection binding inspections expose their redirection

A service redirection binding inspection SHALL expose `targetServiceIdentifier` and `redirection`. The `redirection` is a service inspection for the target service identifier. Its name, tags, optional flag and multiplicity are the ones of the request being redirected.

#### Scenario: Redirection is inspected with inherited constraints

- **GIVEN** `Weapon` bound with `toService(Katana)` and `Katana` bound to itself
- **WHEN** `inspectCurrentPlan(Weapon, { optional: true })` is called
- **THEN** `root.binding.type` is `ServiceRedirection` and `root.binding.targetServiceIdentifier` is `Katana`
- **AND** `root.binding.redirection.serviceIdentifier` is `Katana`, `root.binding.redirection.optional` is `true`, and it exposes the binding of `Katana` to itself

### Requirement: Inspection reflects context-dependent binding selection

Bindings whose constraints depend on the request's ancestors (such as parent or ancestor constraints) SHALL be selected in the inspection exactly as resolution would select them at that position in the plan.

#### Scenario: Parent-constrained bindings

- **GIVEN** `Weapon` bound to `Katana` when the parent is `Ninja`, and to `Bow` when the parent is `Archer`
- **AND** both `Ninja` and `Archer` inject `Weapon`
- **WHEN** the plans for `Ninja` and for `Archer` are inspected
- **THEN** the `Weapon` dependency of `Ninja` exposes the `Katana` binding
- **AND** the `Weapon` dependency of `Archer` exposes the `Bow` binding

### Requirement: Inspection does not resolve services

Inspecting a plan SHALL NOT construct instances, call dynamic value builders, factories or resolved value factories, run activation handlers, run post-construct methods, or populate scope caches. Planning-time behavior (binding constraint evaluation and autobinding) SHALL still apply as it would for resolution.

#### Scenario: No instantiation or activation

- **GIVEN** `Weapon` bound to `Katana` in singleton scope with an activation handler, and `Katana`'s constructor is observable
- **WHEN** the plan for `Weapon` is inspected
- **THEN** `Katana`'s constructor has not been called and the activation handler has not run
- **AND** a later `get(Weapon)` still constructs `Katana` once and runs the activation handler

#### Scenario: Dynamic values are not evaluated

- **GIVEN** `Weapon` bound to a dynamic value whose builder is observable
- **WHEN** the plan for `Weapon` is inspected
- **THEN** the builder has not been called

### Requirement: Inspection uses the container's current plan

`inspectCurrentPlan` SHALL inspect the plan resolution would use for the same request at call time. It SHALL reuse a cached plan when one exists. Otherwise it SHALL create and cache the plan exactly as resolution would, notifying plan observers (such as plugin `onPlan` handlers) the same way. Plans SHALL include bindings provided by ancestor containers when resolution would use them.

#### Scenario: Inspection shares the plan cache with resolution

- **GIVEN** a container with a plugin that counts `onPlan` notifications, and no prior request for `Weapon`
- **WHEN** the plan for `Weapon` is inspected and then `get(Weapon)` is called
- **THEN** exactly one `onPlan` notification for `Weapon` has been observed

#### Scenario: Parent container bindings are inspected

- **GIVEN** a child container whose parent binds `Weapon` to `Katana`
- **WHEN** the plan for `Weapon` is inspected through the child container
- **THEN** `root.binding` describes the parent's binding to `Katana`

### Requirement: Planning failures surface as resolution errors

When planning the request fails, `inspectCurrentPlan` SHALL throw the same error `get` (for single requests) or `getAll` (for multiple requests) would throw for the same request. Failures include: no matching binding for a non-optional request, several matching bindings for a single request, and maximum plan depth exceeded.

#### Scenario: Missing binding

- **GIVEN** a container with no binding for `Weapon`
- **WHEN** `inspectCurrentPlan(Weapon)` is called
- **THEN** it throws an error equal in kind and message to the one thrown by `get(Weapon)`

#### Scenario: Ambiguous bindings

- **GIVEN** `Weapon` bound to `Katana` and to `Shuriken` without constraints
- **WHEN** `inspectCurrentPlan(Weapon)` is called
- **THEN** it throws an error equal in kind and message to the one thrown by `get(Weapon)`

#### Scenario: Missing transitive dependency

- **GIVEN** `Ninja` injects `Weapon` and there is no binding for `Weapon`
- **WHEN** the plan for `Ninja` is inspected
- **THEN** it throws an error equal in kind and message to the one thrown by `get(Ninja)`

### Requirement: Inspections are snapshots

A returned plan inspection SHALL be fully built when `inspectCurrentPlan` returns. Later container changes (binding, unbinding, rebinding, loading or unloading modules, restoring snapshots) SHALL NOT change it. A subsequent `inspectCurrentPlan` call SHALL reflect the container's state at that time.

#### Scenario: Rebinding after inspection

- **GIVEN** `Weapon` bound to `Katana`, and an inspection of the plan for `Weapon`
- **WHEN** `Weapon` is rebound to `Shuriken`
- **THEN** the earlier inspection's `root.binding.implementationType` is still `Katana`
- **AND** a new inspection's `root.binding.implementationType` is `Shuriken`

### Requirement: Shared and cyclic plan nodes are inspected once

Within one inspection, a service request the plan shares between several dependents SHALL be represented by the same service inspection object. Inspecting a plan whose service graph contains a cycle SHALL terminate. Where the cycle closes, the graph SHALL reference the service inspection already being built.

#### Scenario: Shared dependency

- **GIVEN** `Ninja` injects `Weapon` and `Shield`, both `Katana` and `Buckler` inject a context-free `Material` dependency, and the container plans `Material` once and reuses it
- **WHEN** the plan for `Ninja` is inspected
- **THEN** the `Material` service inspection reached through `Katana` and the one reached through `Buckler` are the same object

#### Scenario: Cyclic plan graph

- **GIVEN** a plan in which a service request is reachable from its own dependencies
- **WHEN** the plan is inspected
- **THEN** inspection returns without exhausting the stack
- **AND** the dependency that closes the cycle is the same object as the ancestor service inspection
