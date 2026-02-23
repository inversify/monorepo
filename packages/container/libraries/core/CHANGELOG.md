# @inversifyjs/core

## 10.0.0-beta.0

### Major Changes

- Remove `Provider`
- Remove `ProviderBinding`

### Minor Changes

- Updated core package to be ESM only

### Patch Changes

- Updated dependencies
  - @inversifyjs/common@2.0.0-beta.0
  - @inversifyjs/reflect-metadata-utils@1.5.0-beta.0
  - @inversifyjs/prototype-utils@0.2.0-beta.0

## 9.2.0

### Minor Changes

- Added`BindingManager.unbindAllSync()`

## 9.1.2

### Patch Changes

- Updated circular dependency detection to handle V8 issues on nearly exhausted call stack scenarios

## 9.1.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/prototype-utils@0.1.3

## 9.1.0

### Minor Changes

- Updated `Factory` to allow async functions.
- Updated `FactoryBinding.factory` to allow async factory builders.

## 9.0.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.4.1

## 9.0.0

### Major Changes

- 6d890ac: Updated `ClassMetadata.lifecycle` to allow multiple preDestroy and postConstruct methods

### Patch Changes

- 0f0fcdc: Deprecated `Provider` type. Use `Factory` instead. Providers will be removed in v8. Providers exist for historical reasons from v5 when async dependencies weren't supported. Factories are more flexible and can handle both sync and async operations.
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.4.0

## 8.0.0

### Major Changes

- 67db8bd: Updated `BindingService` with autobind options
- 07abb74: Renamed `BasePlanParamsAutobindOptions` to `AutobindOptions`

## 7.2.0

### Minor Changes

- 8a6722f: Updated `decorate` to allow method param decoration

## 7.1.1

### Patch Changes

- 1cc1a4d: Fix `injectFromHierarchy` to ignore Object in prototype traversal, preventing missing metadata errors when extending undecorated Object.

## 7.1.0

### Minor Changes

- 2f6e6e4: Added `injectFromHierachy`

## 7.0.1

### Patch Changes

- 9db671c: Updated `resolve` to handle circular dependencies
- 95b2570: Updated `addServiceNodeBindingIfContextFree` to handle stack overflow errors

## 7.0.0

### Major Changes

- 2392b15: Removed `PlanResultCacheService.invalidateService` in favor of `invalidateServiceBinding`
- e30a884: Updated `PlanParamsOperations` with context

### Minor Changes

- e30a884: Added `NonCachedServiceNodeContext`

## 6.0.1

### Patch Changes

- 1bdf12a: Updated `BindingService`, `ActivationsService` and `DeactivationsService` to receive a `getParent` param. This way restoring a parent container no longer leads to invalid parent references

## 6.0.0

### Major Changes

- 93f51e5: Updated `PlanServiceNode` with no `parent`
- 93f51e5: Updated `BaseBindingNode` with no `parent`
- 8fedb21: Updated `BasePlanParams` without methods in favor of an `operations` property

### Minor Changes

- d30137c: Updated `BasePlanParams` with `setPlan`
- 64fd9ba: Updated `PlanResultCacheService` with `invalidateService`
- d30137c: update plan to reuse `PlanServiceNode` objects
- d30137c: updated `BasePlanParams` with `getPlan`

### Patch Changes

- d5c40a1: Updated `GetPlanOptions` with `chained` property
- 816f789: Updated `PlanServiceNode.bindings` to no longer be readonly
- d5c40a1: Updated `PlanResultCacheService` to avoid collisions with chained service related plans
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.3.0

## 5.4.0

### Minor Changes

- 7de8779: Updated metadata models with `chained` property
- 2e3c027: Updated `BindingService` with `getChained`
- 197d937: Updated `multiInject` with optional `MultiInjectOptions`

## 5.3.3

### Patch Changes

- Updated dependencies
  - @inversifyjs/common@1.5.2
  - @inversifyjs/prototype-utils@0.1.2

## 5.3.2

### Patch Changes

- Updated dependencies
  - @inversifyjs/common@1.5.1
  - @inversifyjs/reflect-metadata-utils@1.2.0
  - @inversifyjs/prototype-utils@0.1.1

## 5.3.1

### Patch Changes

- 38d1a6d: Fixed BindingService clone method.

## 5.3.0

### Minor Changes

- 50ef5eb: Updated `BindingService` with `getBoundServices`

### Patch Changes

- 5d8c35d: Fixed child container memory leak in most cases

  Provided that there is a [job](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#job) in the event loop after constructing a child container, its cache service will eventually be garbage collected along with the child container itself, rather than persisting until the parent container's garbage collection.

- edbefaa: Updated `BindingService.clone` to properly clone bindings.

## 5.2.0

### Minor Changes

- 56dc0cd: Added `getBindingId`

### Patch Changes

- 1bb859a: Updated `resolve` to set class metadata scope bindings when autobind options are set

## 5.1.0

### Minor Changes

- 77150f5: Updated `BindingService` with `removeById`
- 77150f5: Updated `BindingService` with `getById`
- 78e1b49: Added `resolveBindingsDeactivations`

## 5.0.0

### Major Changes

- 6de1cee: updated `BasePlanParams.servicesBranch` to be an array

### Patch Changes

- 7ef055a: Updated `plan` to no longer provide false positive circular dependencies

## 4.0.1

### Patch Changes

- a77354a: Update `cacheResolvedValue` to set promise like cache values until promise is fullfilled

## 4.0.0

### Major Changes

- 4fb30e9: Renamed `BindingMetadata` to `BindingConstraints`

## 3.5.0

### Minor Changes

- e11ad62: Added `ResolvedValueMetadata`
- e11ad62: Updated `PlanServiceNodeParent` to include `ResolvedValueBindingNode`
- e11ad62: Added `ResolvedValueBinding`
- e11ad62: Added `ResolvedValueBindingNode`

## 3.4.0

### Minor Changes

- b1a18b6: Added `PlanResultCacheService`

## 3.3.0

### Minor Changes

- 9c713eb: Updated `GetOptions` with autobind

## 3.2.0

### Minor Changes

- 7743276: Updated plan related error messages with binding metadata details

### Patch Changes

- 7572767: Updated `OneToManyMapStar.clone` to properly clone map array values
- 9621865: Updated `injectBase` default values to be true
- 559efd8: Updated `BindToFluentSyntaxImplementation.toDynamicValue` with right default scope

## 3.1.0

### Minor Changes

- 1c93440: Updated `unmanaged` to support method decoration
- 1c93440: Updated `inject` to support method decoration
- 1c93440: Updated `optional` to support method decoration
- 1c93440: Updated `named` to support method decoration
- 1c93440: Updated `tagged` to support method decoration
- 1c93440: Updated `multiInject` to support method decoration

### Patch Changes

- c80459d: Updated `OneToManyMapStar` to fix an issue involving a deletion use case

## 3.0.2

### Patch Changes

- c346802: Updated `DeactivationService` to allow duplicated deactivations
- c346802: Updated `ActivationService` to allow duplicated activations

## 3.0.1

### Patch Changes

- 0dadb6a: Updated `MaybeClassElementMetadataKind` values to avoid collisions
- 7e751e2: Updated resolve flow to keep default values on optional property injection
- 5c9ebca: Updated decorator metadata access to avoid conflicts with base type metadata
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.1.0

## 3.0.0

### Major Changes

- 7f97e76: Removed `MetadataTargetName`
- 7f97e76: Updated `ManagedClassElementMetadata` with no `targetName`
- 7f97e76: Updated `MaybeManagedClassElementMetadata` with no `targetName`
- 7f97e76: Removed `targetName`

### Minor Changes

- 50fa92a: Updated `BindingService` with `getNonParentBindings`
- 6c381a8: Updated `BindingToSyntax` with more flexible factory and provider constraints
- bbddebc: Updated `Provider` with right args.

## 2.2.0

### Minor Changes

- f487c1b: Updated `BindingService` with `getNonParentBoundServices`
- 5fac244: Updated `injectFromBase` options to be optional.

### Patch Changes

- e708d1e: Updated `injectable` to filter out non userland emitted metadata
- 2d74b3f: Updated BindingActivation with missing `ResolutionContext` param
- 9d5ac91: Updated `injectable` to throw on duplicated call

## 2.1.0

### Minor Changes

- 142b763: Added `targetName` decorator

### Patch Changes

- 27ddc35: Removed unexpected `LegacyQueryableString`
- 9257c9a: Updated `BindToFluentSyntaxImplementation.to` to set binding scope if found in class metadata

## 2.0.0

### Major Changes

- 9036007: Removed `LegacyTarget`.
- a3e2dd0: Removed `LegacyMetadata`.
- a3e2dd0: Removed `getClassMetadataFromMetadataReader`.
- 11b499a: Renamed `BindingService.remove` to `removeAllByServiceId`.
- a3e2dd0: Updated `getClassMetadata` to no longer rely on legacy reflected metadata
- 9036007: Remove `getTargets`.
- a3e2dd0: Removed `LegacyMetadataReader`.

### Minor Changes

- 5b4ee18: Added `resolveModuleDeactivations`.
- 2dbd2d6: Updated `BindingMetadata` with `serviceIdentifier` and `getAncestor`.
- 0ce84d0: Added `Binding`.
- 2bcbcad: Added `optional`.
- 2bcbcad: Added `multiInject`.
- b7fab72: Updated `ManagedClassElementMetadata` with `isFromTypescriptParamType`.
- d6efacc: Added `decorate`.
- d7cc2b4: Added `resolve`.
- 2bcbcad: Added `named`.
- b5fad23: Added `resolveServiceDeactivations`.
- 0ce84d0: Added `ActivationService`.
- 28c3452: Added `plan`.
- 2bcbcad: Added `postConstruct`.
- 2bcbcad: Added `unmanaged`.
- 501c5f1: Added `DeactivationsService`.
- 2bcbcad: Added `tagged`.
- 2bcbcad: Added `injectFromBase`.
- 6ddbf41: Updated `ClassMetadata` with `scope`.
- 0ce84d0: Added `BindingService`.
- 2bcbcad: Added `inject`.
- 2bcbcad: Added `preDestroy`.
- 2bcbcad: Added `injectable`.

### Patch Changes

- 6b52b45: Updated rollup config to provide right source map file paths.
- 14ce6cd: Updated `getClassMetadata` with missing constructor arguments lenght validation
- a73aa34: Updated `ActivationService.get` to provide missing parent activations
- Updated dependencies
  - @inversifyjs/prototype-utils@0.1.0
  - @inversifyjs/common@1.5.0
  - @inversifyjs/reflect-metadata-utils@1.0.0

## 1.3.5

### Patch Changes

- 2cbb782: Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@0.2.4
  - @inversifyjs/common@1.4.0

## 1.3.4

### Patch Changes

- 535ad85: Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@0.2.3
  - @inversifyjs/common@1.3.3

## 1.3.3

### Patch Changes

- 0e347ab: Updated get metadata flow to provide better error messages when missing metadata.

## 1.3.2

### Patch Changes

- 2b629d6: Removed wrong os constraint.
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@0.2.2
  - @inversifyjs/common@1.3.2

## 1.3.1

### Patch Changes

- 46b2569: Removed wrong dev engines constraint.
- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@0.2.1
  - @inversifyjs/common@1.3.1

## 1.3.0

### Minor Changes

- 3b6344c: Added `LegacyTargetImpl`.
- 3b6344c: Added `getClassElementMetadataFromLegacyMetadata`.

## 1.2.0

### Minor Changes

- fca62ce: Added `LegacyTarget` model.
- fca62ce: Added `getTargets`.
- c588a5a: Added `getClassMetadataFromMetadataReader`.

### Patch Changes

- 6469c67: Updated `getClassMetadata` to correctly fetch name and target names

## 1.1.2

### Patch Changes

- Updated dependencies
  - @inversifyjs/common@1.3.0

## 1.1.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/common@1.2.1

## 1.1.0

### Minor Changes

- e594986: Added `ClassMetadata`.
- e594986: Added `getClassMetadata`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@0.2.0
  - @inversifyjs/common@1.2.0
