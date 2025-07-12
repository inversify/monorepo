# Implementation Plan: Chained Container Resolution Feature

## Overview

This document outlines the implementation plan for adding a `chained` option to the container's `getAll` and `getAllAsync` methods. When `chained: true` is specified, the container will retrieve services from all bindings in the entire container hierarchy (current container + all parent containers) instead of stopping at the first container that has bindings for the given service identifier.

## Current Behavior vs Proposed Behavior

### Current Behavior
- `childContainer.getAll(serviceId)` returns services from bindings in the child container
- If no bindings found in child, fallback to parent container bindings
- Only one level of the hierarchy contributes to the result

### Proposed Behavior  
- `childContainer.getAll(serviceId, { chained: true })` returns services from bindings across the entire hierarchy
- Given containers c1 → c2 → c3 (where c3 is child of c2, c2 is child of c1)
- c3.getAll(serviceId, { chained: true }) returns services from bindings in c1 + c2 + c3

## Implementation Plan

### 1. Core Changes Required

#### 1.1 Create GetAllOptions Interface
**File:** `/packages/container/libraries/core/src/resolution/models/GetAllOptions.ts` (NEW FILE)
- Create new `GetAllOptions` interface that extends `GetOptions` and adds `chained?: boolean`
- This separates concerns: `GetOptions` remains for single resolution, `GetAllOptions` for multiple resolution

**File:** `/packages/container/libraries/core/src/resolution/models/OptionalGetAllOptions.ts` (NEW FILE)
- Create `OptionalGetAllOptions` interface that extends `GetAllOptions` with `optional: true`

#### 1.2 Modify BindingService  
**File:** `/packages/container/libraries/core/src/binding/services/BindingService.ts`
- Add new method `getChained<TResolved>(serviceIdentifier: ServiceIdentifier): Generator<Binding<TResolved>, void, unknown>`
- This method will use a generator to efficiently yield bindings from the entire hierarchy instead of creating arrays
- Implementation will recursively traverse parent containers and yield all bindings

### 2. Metadata Model Updates

#### 2.1 ClassElementMetadata Enhancement
**File:** `/packages/container/libraries/core/src/metadata/models/BaseManagedClassElementMetadata.ts` (NEW FILE)
- Create `BaseManagedClassElementMetadata<TKind>` interface:
  ```typescript
  export interface BaseManagedClassElementMetadata<TKind>
    extends BaseClassElementMetadata<TKind> {
    isFromTypescriptParamType?: true;
    name: MetadataName | undefined;
    optional: boolean;
    tags: Map<MetadataTag, unknown>;
    value: ServiceIdentifier | LazyServiceIdentifier;
  }
  ```

**File:** `/packages/container/libraries/core/src/metadata/models/SingleInjectionManagedClassElementMetadata.ts` (NEW FILE)
- Create `SingleInjectionManagedClassElementMetadata` type alias:
  ```typescript
  export type SingleInjectionManagedClassElementMetadata =
    BaseManagedClassElementMetadata<ClassElementMetadataKind.singleInjection>;
  ```

**File:** `/packages/container/libraries/core/src/metadata/models/MultipleInjectionManagedClassElementMetadata.ts` (NEW FILE)
- Create `MultipleInjectionManagedClassElementMetadata` interface:
  ```typescript
  export interface MultipleInjectionManagedClassElementMetadata
    extends BaseManagedClassElementMetadata<ClassElementMetadataKind.multipleInjection> {
    chained?: boolean;
  }
  ```

**File:** `/packages/container/libraries/core/src/metadata/models/ManagedClassElementMetadata.ts`
- Update to use discriminated union:
  ```typescript
  export type ManagedClassElementMetadata =
    | SingleInjectionManagedClassElementMetadata
    | MultipleInjectionManagedClassElementMetadata;
  ```

#### 2.2 ResolvedValueElementMetadata Enhancement
**File:** `/packages/container/libraries/core/src/metadata/models/SingleInjectionResolvedValueElementMetadata.ts` (NEW FILE)
- Create `SingleInjectionResolvedValueElementMetadata` type alias:
  ```typescript
  export type SingleInjectionResolvedValueElementMetadata =
    BaseResolvedValueElementMetadata<ResolvedValueElementMetadataKind.singleInjection>;
  // NO chained property - single injection doesn't support it
  ```

**File:** `/packages/container/libraries/core/src/metadata/models/MultipleInjectionResolvedValueElementMetadata.ts` (NEW FILE)
- Create `MultipleInjectionResolvedValueElementMetadata` interface:
  ```typescript
  export interface MultipleInjectionResolvedValueElementMetadata
    extends BaseResolvedValueElementMetadata<ResolvedValueElementMetadataKind.multipleInjection> {
    chained?: boolean; // ONLY multiple injection supports chained
  }
  ```

**File:** `/packages/container/libraries/core/src/metadata/models/ResolvedValueElementMetadata.ts`
- Update to use discriminated union:
  ```typescript
  export type ResolvedValueElementMetadata =
    | SingleInjectionResolvedValueElementMetadata
    | MultipleInjectionResolvedValueElementMetadata;
  ```

#### 2.3 ResolvedValueInjectOptions Updates  
**File:** `/packages/container/libraries/container/src/binding/models/ResolvedValueInjectOptions.ts`
- Update **ONLY** multiple injection interfaces to add `chained?: boolean`:

```typescript
export interface MultipleResolvedValueMetadataInjectOptions<T>
  extends BaseResolvedValueMetadataInjectOptions<T>,
    BaseMultipleResolvedValueMetadataInjectOptions {
  chained?: boolean;
}

interface MultipleOptionalResolvedValueMetadataInjectOptions<T>
  extends BaseResolvedValueMetadataInjectOptions<T>,
    BaseMultipleResolvedValueMetadataInjectOptions,
    BaseOptionalResolvedValueMetadataInjectOptions {
  chained?: boolean;
}
```

- **Do NOT modify** single injection interfaces:
  - `BaseResolvedValueMetadataInjectOptions<T>` (used for single injection)
  - `OptionalResolvedValueMetadataInjectOptions<T>` (single optional injection)

### 3. Decorator Updates

#### 3.1 multiInject Decorator Enhancement
**File:** `/packages/container/libraries/core/src/metadata/models/MultiInjectOptions.ts` (NEW FILE)
- Create `MultiInjectOptions` interface:
  ```typescript
  export interface MultiInjectOptions {
    chained?: boolean;
  }
  ```

**File:** `/packages/container/libraries/core/src/metadata/decorators/multiInject.ts`
- Update `multiInject` decorator with overloaded signatures:
  ```typescript
  export function multiInject(
    serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier
  ): MethodDecorator & ParameterDecorator & PropertyDecorator;
  
  export function multiInject(
    serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
    options?: MultiInjectOptions  // Optional options parameter
  ): MethodDecorator & ParameterDecorator & PropertyDecorator;
  ```

#### 3.2 Metadata Building Functions
**Files:** 
- `/packages/container/libraries/core/src/metadata/calculations/buildManagedMetadataFromMaybeClassElementMetadata.ts`
- Related metadata building functions

- Update `buildManagedMetadataFromMaybeClassElementMetadata` to handle chained option
- Modify related metadata building functions to propagate the `chained` flag through the metadata pipeline

### 4. Resolution Pipeline Updates

#### 4.1 ServiceResolutionManager
**File:** `/packages/container/libraries/container/src/container/services/ServiceResolutionManager.ts`
- Update `getAll` method signature to accept `GetAllOptions` instead of `GetOptions`
- Update `getAllAsync` method signature to accept `GetAllOptions` instead of `GetOptions`
- Update `#buildPlanParams` method to pass `chained` option from `GetAllOptions` to the planning system
- Modify planning to use new chained binding retrieval when `chained: true`

#### 4.2 Planning System Updates
**File:** `/packages/container/libraries/core/src/planning/models/SingleBindingPlanParamsConstraint.ts` (NEW FILE)
- Create `SingleBindingPlanParamsConstraint` interface:
  ```typescript
  export interface SingleBindingPlanParamsConstraint {
    name?: MetadataName;
    isMultiple: false;
    isOptional?: true;
    serviceIdentifier: ServiceIdentifier;
    tag?: PlanParamsTagConstraint;
    // NO chained property - single binding doesn't support it
  }
  ```

**File:** `/packages/container/libraries/core/src/planning/models/MultipleBindingPlanParamsConstraint.ts` (NEW FILE)
- Create `MultipleBindingPlanParamsConstraint` interface:
  ```typescript
  export interface MultipleBindingPlanParamsConstraint {
    name?: MetadataName;
    isMultiple: true;
    isOptional?: true;
    serviceIdentifier: ServiceIdentifier;
    tag?: PlanParamsTagConstraint;
    chained?: boolean; // Only multiple binding supports chained
  }
  ```

**File:** `/packages/container/libraries/core/src/planning/models/PlanParamsConstraint.ts`
- Update to use discriminated union:
  ```typescript
  export type PlanParamsConstraint =
    | SingleBindingPlanParamsConstraint
    | MultipleBindingPlanParamsConstraint;
  ```

**File:** `/packages/container/libraries/core/src/planning/calculations/plan.ts`
- Update `plan` function to pass chained option for root service:
  ```typescript
  export function plan(params: PlanParams): PlanResult {
    // ...existing code...
    
    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, {
        chained: params.rootConstraints.isMultiple && params.rootConstraints.chained === true
      });
    
    // ...rest unchanged
  }
  ```

- Update `buildPlanServiceNodeFromClassElementMetadata` to pass chained from metadata:
  ```typescript
  function buildPlanServiceNodeFromClassElementMetadata(
    params: SubplanParams,
    bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ClassElementMetadata,
  ): PlanServiceNode | undefined {
    // ...existing code...
    
    // Extract chained from metadata if it's multiple injection
    const chained = elementMetadata.kind === ClassElementMetadataKind.multipleInjection 
      ? elementMetadata.chained 
      : undefined;
    
    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, { chained });
    
    // ...rest unchanged
  }
  ```

- Update `buildPlanServiceNodeFromResolvedValueElementMetadata` to pass chained from metadata:
  ```typescript
  function buildPlanServiceNodeFromResolvedValueElementMetadata(
    params: SubplanParams,
    bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ): PlanServiceNode {
    // ...existing code...
    
    // Extract chained from metadata if it's multiple injection
    const chained = elementMetadata.kind === ResolvedValueElementMetadataKind.multipleInjection 
      ? elementMetadata.chained 
      : undefined;
    
    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, { chained });
    
    // ...rest unchanged
  }
  ```

**File:** `/packages/container/libraries/core/src/planning/models/BasePlanParams.ts`
- Add `getBindingsChained` method to `BasePlanParams`:
  ```typescript
  export interface BasePlanParams {
    autobindOptions: BasePlanParamsAutobindOptions | undefined;
    getBindings: <TInstance>(
      serviceIdentifier: ServiceIdentifier<TInstance>,
    ) => Iterable<Binding<TInstance>> | undefined;
    getBindingsChained: <TInstance>(
      serviceIdentifier: ServiceIdentifier<TInstance>,
    ) => Generator<Binding<TInstance>, void, unknown>;
    getClassMetadata: (type: Newable) => ClassMetadata;
    servicesBranch: ServiceIdentifier[];
    setBinding: <TInstance>(binding: Binding<TInstance>) => void;
  }
  ```

### 5. Container API Updates

#### 5.1 Container getAll Methods
**File:** `/packages/container/libraries/container/src/container/services/Container.ts`
- Update `getAll` method signature to accept `GetAllOptions` instead of `GetOptions`
- Update `getAllAsync` method signature to accept `GetAllOptions` instead of `GetOptions`
- Keep `get` and `getAsync` methods unchanged (they should NOT support chained option)

### 6. Key Implementation Details

#### 6.1 New BindingService Method Implementation
The new `getChained` generator method will implement recursive hierarchy traversal:

```typescript
public *getChained<TResolved>(
  serviceIdentifier: ServiceIdentifier,
): Generator<Binding<TResolved>, void, unknown> {
  // Yield from current container
  const currentBindings = this.getNonParentBindings<TResolved>(serviceIdentifier);
  if (currentBindings) {
    yield* currentBindings;
  }

  // Yield from parent hierarchy  
  if (this.#parent) {
    yield* this.#parent.getChained<TResolved>(serviceIdentifier);
  }
}
```

#### 6.3 Planning Logic Update
The planning system correctly propagates chained information through the dependency tree:

**Root Service Resolution:**
```typescript
// In plan() function:
const filteredServiceBindings: Binding<unknown>[] =
  buildFilteredServiceBindings(params, bindingConstraints, {
    chained: params.rootConstraints.isMultiple && 
             'chained' in params.rootConstraints ? 
             (params.rootConstraints.chained ?? false) : false
  });
```

**Class Element Dependency Resolution:**
```typescript
// In buildPlanServiceNodeFromClassElementMetadata:
const chained: boolean =
  elementMetadata.kind === ClassElementMetadataKind.multipleInjection
    ? (elementMetadata.chained ?? false)
    : false;

const filteredServiceBindings: Binding<unknown>[] =
  buildFilteredServiceBindings(params, bindingConstraints, { chained });
```

**Resolved Value Dependency Resolution:**
```typescript
// In buildPlanServiceNodeFromResolvedValueElementMetadata:
const chained: boolean =
  elementMetadata.kind === ResolvedValueElementMetadataKind.multipleInjection
    ? (elementMetadata.chained ?? false)
    : false;

const filteredServiceBindings: Binding<unknown>[] =
  buildFilteredServiceBindings(params, bindingConstraints, { chained });
```

This ensures that:
- **Each service resolution** uses chained behavior based on its own metadata
- **Nested dependencies** can have different chained behavior than their parent
- **Single injection scenarios** never use chained retrieval
- **Multiple injection with `chained: true`** uses hierarchy-wide binding collection

#### 6.4 Specific Type Implementations
Update metadata building functions to handle the new discriminated union types:

**File:** `/packages/container/libraries/core/src/metadata/calculations/buildManagedMetadataFromMaybeClassElementMetadata.ts`
- Update to return appropriate type based on `ClassElementMetadataKind`:
  ```typescript
  export const buildManagedMetadataFromMaybeClassElementMetadata: (
    kind: ClassElementMetadataKind.multipleInjection,
    serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
    options?: MultiInjectOptions,
  ) => (metadata: MaybeClassElementMetadata | undefined) => MultipleInjectionManagedClassElementMetadata;
  
  export const buildManagedMetadataFromMaybeClassElementMetadata: (
    kind: ClassElementMetadataKind.singleInjection,
    serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
  ) => (metadata: MaybeClassElementMetadata | undefined) => SingleInjectionManagedClassElementMetadata;
  ```

#### 6.5 Type Guard Functions (NEW FILES)
**File:** `/packages/container/libraries/core/src/metadata/guards/isMultipleInjectionManagedClassElementMetadata.ts`
- Create type guard:
  ```typescript
  export function isMultipleInjectionManagedClassElementMetadata(
    metadata: ManagedClassElementMetadata
  ): metadata is MultipleInjectionManagedClassElementMetadata {
    return metadata.kind === ClassElementMetadataKind.multipleInjection;
  }
  ```

**File:** `/packages/container/libraries/core/src/metadata/guards/isMultipleInjectionResolvedValueElementMetadata.ts`
- Create type guard:
  ```typescript
  export function isMultipleInjectionResolvedValueElementMetadata(
    metadata: ResolvedValueElementMetadata
  ): metadata is MultipleInjectionResolvedValueElementMetadata {
    return metadata.kind === ResolvedValueElementMetadataKind.multipleInjection;
  }
  ```

### 7. Backward Compatibility

- All changes maintain full backward compatibility
- Default behavior (`chained: false` or `undefined`) remains completely unchanged
- New functionality is opt-in via the `chained` option
- Existing code will continue to work without any modifications
- No breaking changes to public APIs

### 8. Testing Strategy

- Update existing tests to ensure backward compatibility is maintained
- Add new test suites for chained resolution behavior
- Test complex container hierarchies (3+ levels deep)
- Test edge cases: empty containers, circular references, mixed chained/non-chained usage
- Test both decorator-based and resolved value-based injection with chained option

### 9. Affected Components Summary

This implementation addresses the key components with proper scope restrictions:
- ✅ Metadata models (`ClassElementMetadata`, `ResolvedValueElementMetadata`) - **ONLY for multiple injection types**
- ✅ `multiInject` decorator with options support - **ONLY for multiple injection** 
- ✅ Resolved values integration via `ResolvedValueInjectOptions` - **ONLY for multiple injection interfaces**
- ✅ Container hierarchy traversal via `BindingService`
- ✅ `GetAllOptions` creation for `getAll`/`getAllAsync` methods **ONLY**
- ❌ Single injection decorators (`@inject`) - **DO NOT support chained option**
- ❌ `get`/`getAsync` methods - **DO NOT support chained option**
- ❌ Single injection resolved values - **DO NOT support chained option**

### 10. Implementation Order

1. Create new interfaces and types:
   - `GetAllOptions`, `OptionalGetAllOptions`
   - `MultiInjectOptions`
   - `BaseManagedClassElementMetadata` (base interface for managed class element metadata)
   - `SingleInjectionManagedClassElementMetadata`, `MultipleInjectionManagedClassElementMetadata`
   - `SingleInjectionResolvedValueElementMetadata`, `MultipleInjectionResolvedValueElementMetadata`
   - Type guard functions
2. Implement `BindingService.getChained()` generator method  
3. Update planning pipeline to support chained option
4. Update metadata building functions to handle new discriminated unions
5. Enhance `multiInject` decorator with optional `MultiInjectOptions` parameter
6. Update resolved values integration (for multiple injection interfaces only)
7. Update `Container.getAll()` and `Container.getAllAsync()` method signatures
8. Update `ServiceResolutionManager.getAll()` and `ServiceResolutionManager.getAllAsync()` method signatures
9. Add comprehensive tests
10. Update documentation

## Key Corrections Made

### Type System Improvements
- **Created discriminated union types** for proper type safety:
  - `BaseManagedClassElementMetadata<TKind>` as the base interface for managed class elements
  - `SingleInjectionManagedClassElementMetadata` vs `MultipleInjectionManagedClassElementMetadata`
  - `SingleInjectionResolvedValueElementMetadata` vs `MultipleInjectionResolvedValueElementMetadata`
- **Added type guard functions** for runtime type checking
- **Created dedicated `MultiInjectOptions` interface** instead of inline type
- **Made options parameter optional** in `multiInject` decorator

### Scope Restrictions Applied
- **`chained` option ONLY applies to multiple injection scenarios**
- **Single injection types explicitly DO NOT have chained property**
- **Created separate `GetAllOptions` instead of polluting `GetOptions`**
- **Only multiple injection metadata models support chained**
- **Only multiple injection resolved value interfaces support chained**

### API Design Improvements
- **Optional options parameter** in `multiInject` decorator with proper TypeScript overloads
- **Proper discriminated unions** enable compile-time type safety
- **Type guards** enable runtime type checking and narrowing

## Notes

- The term "chained" was chosen to indicate traversal through the container chain/hierarchy
- This feature enables advanced dependency injection scenarios where services need to be collected from multiple container scopes
- The implementation follows existing patterns in the codebase for consistency

## Status

### ✅ Completed
- **1. Core Changes** - Created `GetAllOptions`, `OptionalGetAllOptions`, and `MultiInjectOptions` interfaces
- **2. Metadata Model Updates** - Refactored metadata types to use discriminated unions with `chained` support
- **3. Decorator Updates** - Updated `multiInject` decorator to accept options with `chained` parameter
- **4. Planning System Updates** - Updated planning system to propagate `chained` option through the entire resolution pipeline
- **4.1 Plan Constraints** - Updated plan constraints to use discriminated unions and support chained resolution
- **4.2 Node Building** - Updated `buildPlanServiceNodeFromClassElementMetadata` and `buildPlanServiceNodeFromResolvedValueElementMetadata` to extract and use `chained` from metadata

### 🔄 In Progress
- **5. Resolution System Updates** - Update resolution system to handle chained resolution
- **6. Container API Updates** - Update container `getAll` and `getAllAsync` methods to accept options
- **7. Testing** - Add comprehensive tests for chained resolution feature
- **8. Documentation** - Update documentation and examples

### 📋 Pending
- **9. Integration Testing** - Test the complete feature with realistic scenarios
- **10. Performance Testing** - Validate performance characteristics of chained resolution
