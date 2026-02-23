# @inversifyjs/common

## 2.0.0-beta.0

### Major Changes

- Updated `ServiceIdentifier` type. Now, a `Function` is a valid `ServiceIdentifier<T>` if and only if it satisfies `AbstractNewable<T> | Newable<T>`
- Updated package to be ESM only

## 1.5.2

### Patch Changes

- 7be0ee1: Reverted `ServiceIdentifier` to rely on `Function`

## 1.5.1

### Patch Changes

- babcc5e: Replace Function with AbstractNewable in ServiceIdentifier type

  ServiceIdentifier now uses AbstractNewable instead of Function to better represent abstract classes. This provides better type safety and semantics.

## 1.5.0

### Minor Changes

- 1ab083b: Added `isPromise`.

### Patch Changes

- 6b52b45: Updated rollup config to provide right source map file paths.

## 1.4.0

### Minor Changes

- da1a1c4: Added `stringifyServiceIdentifier`.
- da1a1c4: Added `Either`.

### Patch Changes

- 2cbb782: Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.

## 1.3.3

### Patch Changes

- 535ad85: Updated ESM build to be compatible with both bundler and NodeJS module resolution algorithms

## 1.3.2

### Patch Changes

- 2b629d6: Removed wrong os constraint.

## 1.3.1

### Patch Changes

- 46b2569: Removed wrong dev engines constraint.

## 1.3.0

### Minor Changes

- 611f75f: Updated `ServiceIdentifier` to allow `Function`

## 1.2.1

### Patch Changes

- cb8882f: Updated LazyServiceIdentifier.is to support nullish values

## 1.2.0

### Minor Changes

- 5dc74ff: Added ESM modules support

## 1.1.0

### Minor Changes

- db82004: Added `Newable`
- f83735d: Added `LazyServiceIdentifier`
- a94895d: Added `ServiceIdentifier`
