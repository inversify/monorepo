# @inversifyjs/reflect-metadata-utils

## 1.5.0-beta.0

### Minor Changes

- Updated package to be ESM only

## 1.4.1

### Patch Changes

- Unify the peer-dep requirement for `reflect-metadata`

## 1.4.0

### Minor Changes

- bc06943: Added `buildEmptySetMetadata`
- 0f3b8a5: Added `updateSetMetadataWithList`

## 1.3.0

### Minor Changes

- 251b2e5: Added `buildArrayMetadataWithArray`, `buildArrayMetadataWithElement`, `buildArrayMetadataWithIndex`, `buildEmptyArrayMetadata` and `buildEmptyMapMetadata` functions.

## 1.2.0

### Minor Changes

- d9a4594: Updated API functions with optional propertyKey param

## 1.1.0

### Minor Changes

- 68b15b1: Added `getOwnReflectMetadata`
- d75544b: Added `updateOwnReflectMetadata`

## 1.0.0

### Major Changes

- a4276ba: Updated `updateReflectMetadata` to receive a default value builder.

### Minor Changes

- a4276ba: Added `setReflectMetadata`.

### Patch Changes

- 6b52b45: Updated rollup config to provide right source map file paths.

## 0.2.4

### Patch Changes

- 2cbb782: Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.

## 0.2.3

### Patch Changes

- 535ad85: Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms

## 0.2.2

### Patch Changes

- 2b629d6: Removed wrong os constraint.

## 0.2.1

### Patch Changes

- 46b2569: Removed wrong dev engines constraint.

## 0.2.0

### Minor Changes

- eff2876: Added `getReflectMetadata`.
- eff2876: Added `updateReflectMetadata`.
