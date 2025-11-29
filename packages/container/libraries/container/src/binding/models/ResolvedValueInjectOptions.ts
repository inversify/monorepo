import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';
import { MetadataName, MetadataTag } from '@inversifyjs/core';

export type ResolvedValueInjectOptions<T> =
  | LazyServiceIdentifier<T>
  | ResolvedValueMetadataInjectOptions<T>
  | ServiceIdentifier<T>;

/*
 * Consider https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 * to understand how the conditional types are distributed and why one element array types are used.
 */

export type ResolvedValueMetadataInjectOptions<T> = [T] extends [
  (infer U)[] | undefined,
]
  ? [T] extends [U[]]
    ? MultipleResolvedValueMetadataInjectOptions<U>
    : MultipleOptionalResolvedValueMetadataInjectOptions<U>
  : T extends undefined
    ? OptionalResolvedValueMetadataInjectOptions<T>
    : BaseResolvedValueMetadataInjectOptions<T>;

interface BaseResolvedValueMetadataInjectOptions<T> {
  name?: MetadataName;
  serviceIdentifier: ServiceIdentifier<T> | LazyServiceIdentifier<T>;
  tags?: ResolvedValueMetadataInjectTagOptions[];
}

interface BaseMultipleResolvedValueMetadataInjectOptions {
  chained?: boolean;
  isMultiple: true;
}

interface BaseOptionalResolvedValueMetadataInjectOptions {
  optional: true;
}

export interface MultipleResolvedValueMetadataInjectOptions<T>
  extends
    BaseResolvedValueMetadataInjectOptions<T>,
    BaseMultipleResolvedValueMetadataInjectOptions {}

interface MultipleOptionalResolvedValueMetadataInjectOptions<T>
  extends
    BaseResolvedValueMetadataInjectOptions<T>,
    BaseMultipleResolvedValueMetadataInjectOptions,
    BaseOptionalResolvedValueMetadataInjectOptions {}

export interface OptionalResolvedValueMetadataInjectOptions<T>
  extends
    BaseResolvedValueMetadataInjectOptions<T>,
    BaseOptionalResolvedValueMetadataInjectOptions {}

export interface ResolvedValueMetadataInjectTagOptions {
  key: MetadataTag;
  value: unknown;
}
