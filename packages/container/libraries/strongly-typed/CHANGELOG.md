# @inversifyjs/strongly-typed

## 3.0.0-beta.0

### Major Changes

- Updated package to be ESM only

### Patch Changes

- Updated dependencies
  - inversify@8.0.0-beta.0

## 2.2.0

### Minor Changes

- 636f967: Export Bind, IsBound, OnActivation, OnDeactivation, Rebind, RebindSync, Unbind, UnbindSync

## 2.1.0

### Minor Changes

- 2516897: Updated `TypedContainer` with `rebindSync`
- 2516897: Updated `TypedContainer` with `unbindSync`
- ebac67a: Added support for strongly-typed container modules
- 2516897: Updated `TypedContainer` with `rebind`

## 2.0.1

### Patch Changes

- a107be1: Fix `.unbind()` return type to be `Promise`

## 2.0.0

### Major Changes

- fa63aaf: Update to reflect `inversify@7` types

## 1.2.3

### Patch Changes

- 6b52b45: Updated rollup config to provide right source map file paths.

## 1.2.2

### Patch Changes

- 1564a20: Fixed types to allow use of generic helper functions

## 1.2.1

### Patch Changes

- 8c43d6c: Fix `TypedMultiInject` export

## 1.2.0

### Minor Changes

- e505894: Added `TypedMultiInject`

## 1.1.1

### Patch Changes

- 2cbb782: Updated ESM build to provide proper types regardless of the ts resolution module strategy in the userland.

## 1.1.0

### Minor Changes

- 3d499a6: Added `TypedInject`
- 5ad2d2f: Added `TypedContainer`
