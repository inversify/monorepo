# @inversifyjs/container

## 1.8.0

### Minor Changes

- dff4be4: Updated `ContainerModuleLoadOptions` with `rebind`
- dff4be4: Updated `ContainerModuleLoadOptions` with `rebindSync`

### Patch Changes

- 3b11f02: Updated `BindToFluentSyntax.toResolvedValue` with additional type constraints

## 1.7.0

### Minor Changes

- 378b122: Updated `Container` with `rebindSync`
- bbdbe53: Updated `Container` with `unbindSync`
- 378b122: Updated `Container` with `rebind`
- ffe9447: Updated `ContainerModuleLoadOptions` with `unbindSync`

### Patch Changes

- ffe9447: Updated `ContainerModuleLoadOptions.unbind` to accept `BindingIdentifier`

## 1.6.0

### Minor Changes

- 5617bce: Updated `BindInFluentSyntax` with `getIdentifier`
- 0466884: Updated `Container.unbind` to handle `BindingIdentifier`
- 5617bce: Updated `BindOnFluentSyntax` with `getIdentifier`
- 5617bce: Updated `BindWhenFluentSyntax` with `getIdentifier`
- d9ab759: Added `BindingIdentifier`
- 5617bce: Added `BoundServiceSyntax`

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@5.1.0

## 1.5.4

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@5.0.0

## 1.5.3

### Patch Changes

- a77354a: Updated `container.get` like methods to no longer initialize twice singleton scoped bindings
- Updated dependencies
  - @inversifyjs/core@4.0.1

## 1.5.2

### Patch Changes

- 6c38c39: Updated Container.restore to refresh computed properties

## 1.5.1

### Patch Changes

- fdc4b96: Improved `Container.get` like methods performance
- Updated dependencies
  - @inversifyjs/core@4.0.0

## 1.5.0

### Minor Changes

- 9ba2c64: Updated `BindToFluentSyntax` with `.toResolvedValue`

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.5.0

## 1.4.2

### Patch Changes

- 1f659f7: Updated `Container` to properly clear planning cache after new bindings are bound

## 1.4.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.4.0

## 1.4.0

### Minor Changes

- 3b47b67: Updated `ContainerOptions` with `autobind`

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.3.0

## 1.3.4

### Patch Changes

- 559efd8: Updated `Container` bind flow to properly bind dynamic values in the right default scope
- 7572767: Updated `Container.snapshot` to properly generate clone binding services
- Updated dependencies
  - @inversifyjs/core@3.2.0

## 1.3.3

### Patch Changes

- 6511d66: Updated `ActivationService` and `DeactivationService` to fix an issue involving a service deactivation edge case
- Updated dependencies
  - @inversifyjs/core@3.1.0

## 1.3.2

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.0.2

## 1.3.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.0.1
  - @inversifyjs/reflect-metadata-utils@1.1.0

## 1.3.0

### Minor Changes

- 1285db1: Updated `BindWhenFluentSyntax` with `whenNoParentIs`
- df484d3: Updated `BindWhenFluentSyntax` with `whenNoAncestorTagged`
- 1285db1: Updated `BindWhenFluentSyntax` with `whenNoParent`
- 1285db1: Updated `BindWhenFluentSyntax` with `whenNoParentNamed`
- df484d3: Updated `BindWhenFluentSyntax` with `whenNoAncestorIs`
- 1285db1: Updated `BindWhenFluentSyntax` with `whenNoParentTagged`
- df484d3: Updated `BindWhenFluentSyntax` with `whenNoAncestorNamed`
- 600a752: Updated `decorate` to allow single decorator
- df484d3: Updated `BindWhenFluentSyntax` with `whenNoAncestor`
- bbbc83f: Updated `Container` with `isCurrentBound`

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@3.0.0

## 1.2.0

### Minor Changes

- acfe7ec: Updated `Container` with `unbindAll`
- eb3cbd4: Updated `ContainerModule.load` to support sync load functions

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@2.2.0

## 1.1.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@2.1.0

## 1.1.0

### Minor Changes

- b974b17: Added `Container`.
- b974b17: Added `InversifyContainerError`.
- b974b17: Added `ContainerModule`.
- b974b17: Added `BindToFluentSyntax`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/core@2.0.0
  - @inversifyjs/common@1.5.0
  - @inversifyjs/reflect-metadata-utils@1.0.0
