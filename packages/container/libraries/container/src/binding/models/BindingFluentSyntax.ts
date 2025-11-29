import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import {
  BindingActivation,
  BindingConstraints,
  BindingDeactivation,
  DynamicValueBuilder,
  Factory,
  MetadataName,
  MetadataTag,
  Provider,
  ResolutionContext,
} from '@inversifyjs/core';

import { BindingIdentifier } from './BindingIdentifier';
import { MapToResolvedValueInjectOptions } from './MapToResolvedValueInjectOptions';

export interface BoundServiceSyntax {
  getIdentifier(): BindingIdentifier;
}

export interface BindToFluentSyntax<T> {
  to(type: Newable<T>): BindInWhenOnFluentSyntax<T>;
  toSelf(): BindInWhenOnFluentSyntax<T>;
  toConstantValue(value: T): BindWhenOnFluentSyntax<T>;
  toDynamicValue(builder: DynamicValueBuilder<T>): BindInWhenOnFluentSyntax<T>;
  toFactory(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    factory: T extends Factory<unknown, any>
      ? (context: ResolutionContext) => T | Promise<T>
      : never,
  ): BindWhenOnFluentSyntax<T>;
  /**
   * @deprecated Use `toFactory()` instead. Providers will be removed in v8.
   * Providers exist for historical reasons from v5 when async dependencies weren't supported.
   * Factories are more flexible and can handle both sync and async operations.
   */
  toProvider(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-deprecated
    provider: T extends Provider<unknown, any>
      ? (context: ResolutionContext) => T
      : never,
  ): BindWhenOnFluentSyntax<T>;
  toResolvedValue(factory: () => T | Promise<T>): BindInWhenOnFluentSyntax<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toResolvedValue<TArgs extends unknown[] = any[]>(
    factory: (...args: TArgs) => T | Promise<T>,
    injectOptions: MapToResolvedValueInjectOptions<TArgs>,
  ): BindInWhenOnFluentSyntax<T>;
  toService(service: ServiceIdentifier<T>): void;
}

export interface BindInFluentSyntax<T> extends BoundServiceSyntax {
  inSingletonScope(): BindWhenOnFluentSyntax<T>;
  inTransientScope(): BindWhenOnFluentSyntax<T>;
  inRequestScope(): BindWhenOnFluentSyntax<T>;
}

export interface BindInWhenOnFluentSyntax<T>
  extends BindInFluentSyntax<T>, BindWhenOnFluentSyntax<T> {}

export interface BindOnFluentSyntax<T> extends BoundServiceSyntax {
  onActivation(activation: BindingActivation<T>): BindWhenFluentSyntax<T>;
  onDeactivation(deactivation: BindingDeactivation<T>): BindWhenFluentSyntax<T>;
}

export interface BindWhenOnFluentSyntax<T>
  extends BindWhenFluentSyntax<T>, BindOnFluentSyntax<T> {}

export interface BindWhenFluentSyntax<T> extends BoundServiceSyntax {
  when(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T>;
  whenAnyAncestor(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T>;
  whenAnyAncestorIs(
    serviceIdentifier: ServiceIdentifier,
  ): BindOnFluentSyntax<T>;
  whenAnyAncestorNamed(name: MetadataName): BindOnFluentSyntax<T>;
  whenAnyAncestorTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T>;
  whenDefault(): BindOnFluentSyntax<T>;
  whenNamed(name: MetadataName): BindOnFluentSyntax<T>;
  whenNoAncestor(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T>;
  whenNoAncestorIs(serviceIdentifier: ServiceIdentifier): BindOnFluentSyntax<T>;
  whenNoAncestorNamed(name: MetadataName): BindOnFluentSyntax<T>;
  whenNoAncestorTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T>;
  whenNoParent(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T>;
  whenNoParentIs(serviceIdentifier: ServiceIdentifier): BindOnFluentSyntax<T>;
  whenNoParentNamed(name: MetadataName): BindOnFluentSyntax<T>;
  whenNoParentTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T>;
  whenParent(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T>;
  whenParentIs(serviceIdentifier: ServiceIdentifier): BindOnFluentSyntax<T>;
  whenParentNamed(name: MetadataName): BindOnFluentSyntax<T>;
  whenParentTagged(tag: MetadataTag, tagValue: unknown): BindOnFluentSyntax<T>;
  whenTagged(tag: MetadataTag, tagValue: unknown): BindOnFluentSyntax<T>;
}
