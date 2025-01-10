# @inversifyjs/core

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
- Updated dependencies [af81ac4]
- Updated dependencies [6b52b45]
- Updated dependencies [a4276ba]
- Updated dependencies [a4276ba]
- Updated dependencies [af81ac4]
- Updated dependencies [1ab083b]
  - @inversifyjs/prototype-utils@0.1.0
  - @inversifyjs/common@1.5.0
  - @inversifyjs/reflect-metadata-utils@1.0.0

## 1.3.5

### Patch Changes

- 2cbb782: Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.
- Updated dependencies [2cbb782]
- Updated dependencies [da1a1c4]
- Updated dependencies [da1a1c4]
  - @inversifyjs/reflect-metadata-utils@0.2.4
  - @inversifyjs/common@1.4.0

## 1.3.4

### Patch Changes

- 535ad85: Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms
- Updated dependencies [535ad85]
  - @inversifyjs/reflect-metadata-utils@0.2.3
  - @inversifyjs/common@1.3.3

## 1.3.3

### Patch Changes

- 0e347ab: Updated get metadata flow to provide better error messages when missing metadata.

## 1.3.2

### Patch Changes

- 2b629d6: Removed wrong os constraint.
- Updated dependencies [2b629d6]
  - @inversifyjs/reflect-metadata-utils@0.2.2
  - @inversifyjs/common@1.3.2

## 1.3.1

### Patch Changes

- 46b2569: Removed wrong dev engines constraint.
- Updated dependencies [46b2569]
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

- Updated dependencies [611f75f]
  - @inversifyjs/common@1.3.0

## 1.1.1

### Patch Changes

- Updated dependencies [cb8882f]
  - @inversifyjs/common@1.2.1

## 1.1.0

### Minor Changes

- e594986: Added `ClassMetadata`.
- e594986: Added `getClassMetadata`.

### Patch Changes

- Updated dependencies [eff2876]
- Updated dependencies [eff2876]
- Updated dependencies [5dc74ff]
  - @inversifyjs/reflect-metadata-utils@0.2.0
  - @inversifyjs/common@1.2.0
