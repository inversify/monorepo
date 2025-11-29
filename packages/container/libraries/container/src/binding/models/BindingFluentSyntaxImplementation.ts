import {
  Newable,
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
import {
  Binding,
  BindingActivation,
  BindingConstraints,
  BindingDeactivation,
  BindingScope,
  bindingScopeValues,
  BindingType,
  bindingTypeValues,
  ClassMetadata,
  ConstantValueBinding,
  DynamicValueBinding,
  DynamicValueBuilder,
  Factory,
  FactoryBinding,
  getClassMetadata,
  InstanceBinding,
  MetadataName,
  MetadataTag,
  Provider,
  ProviderBinding,
  ResolutionContext,
  Resolved,
  ResolvedValueBinding,
  ResolvedValueElementMetadata,
  ResolvedValueElementMetadataKind,
  ResolvedValueMetadata,
  ScopedBinding,
  ServiceRedirectionBinding,
} from '@inversifyjs/core';
import { getBindingId } from '@inversifyjs/core';

import { Writable } from '../../common/models/Writable';
import { BindingConstraintUtils } from '../../container/binding/utils/BindingConstraintUtils';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { buildBindingIdentifier } from '../calculations/buildBindingIdentifier';
import { isAnyAncestorBindingConstraints } from '../calculations/isAnyAncestorBindingConstraints';
import { isAnyAncestorBindingConstraintsWithName } from '../calculations/isAnyAncestorBindingConstraintsWithName';
import { isAnyAncestorBindingConstraintsWithServiceId } from '../calculations/isAnyAncestorBindingConstraintsWithServiceId';
import { isAnyAncestorBindingConstraintsWithTag } from '../calculations/isAnyAncestorBindingConstraintsWithTag';
import { isBindingConstraintsWithName } from '../calculations/isBindingConstraintsWithName';
import { isBindingConstraintsWithNoNameNorTags } from '../calculations/isBindingConstraintsWithNoNameNorTags';
import { isBindingConstraintsWithTag } from '../calculations/isBindingConstraintsWithTag';
import { isMultipleResolvedValueMetadataInjectOptions } from '../calculations/isMultipleResolvedValueMetadataInjectOptions';
import { isNoAncestorBindingConstraints } from '../calculations/isNoAncestorBindingConstraints';
import { isNoAncestorBindingConstraintsWithName } from '../calculations/isNoAncestorBindingConstraintsWithName';
import { isNoAncestorBindingConstraintsWithServiceId } from '../calculations/isNoAncestorBindingConstraintsWithServiceId';
import { isNoAncestorBindingConstraintsWithTag } from '../calculations/isNoAncestorBindingConstraintsWithTag';
import { isNotParentBindingConstraints } from '../calculations/isNotParentBindingConstraints';
import { isNotParentBindingConstraintsWithName } from '../calculations/isNotParentBindingConstraintsWithName';
import { isNotParentBindingConstraintsWithServiceId } from '../calculations/isNotParentBindingConstraintsWithServiceId';
import { isNotParentBindingConstraintsWithTag } from '../calculations/isNotParentBindingConstraintsWithTag';
import { isParentBindingConstraints } from '../calculations/isParentBindingConstraints';
import { isParentBindingConstraintsWithName } from '../calculations/isParentBindingConstraintsWithName';
import { isParentBindingConstraintsWithServiceId } from '../calculations/isParentBindingConstraintsWithServiceId';
import { isParentBindingConstraintsWithTag } from '../calculations/isParentBindingConstraintsWithTag';
import { isResolvedValueMetadataInjectOptions } from '../calculations/isResolvedValueMetadataInjectOptions';
import {
  BindInFluentSyntax,
  BindInWhenOnFluentSyntax,
  BindOnFluentSyntax,
  BindToFluentSyntax,
  BindWhenFluentSyntax,
  BindWhenOnFluentSyntax,
} from './BindingFluentSyntax';
import { BindingIdentifier } from './BindingIdentifier';
import { MapToResolvedValueInjectOptions } from './MapToResolvedValueInjectOptions';
import {
  OptionalResolvedValueMetadataInjectOptions,
  ResolvedValueInjectOptions,
  ResolvedValueMetadataInjectTagOptions,
} from './ResolvedValueInjectOptions';

export class BindInFluentSyntaxImplementation<
  T,
> implements BindInFluentSyntax<T> {
  readonly #binding: Writable<ScopedBinding<BindingType, BindingScope, T>>;

  constructor(binding: Writable<ScopedBinding<BindingType, BindingScope, T>>) {
    this.#binding = binding;
  }

  public getIdentifier(): BindingIdentifier {
    return buildBindingIdentifier(this.#binding);
  }

  public inRequestScope(): BindWhenOnFluentSyntax<T> {
    this.#binding.scope = bindingScopeValues.Request;

    return new BindWhenOnFluentSyntaxImplementation(this.#binding);
  }

  public inSingletonScope(): BindWhenOnFluentSyntax<T> {
    this.#binding.scope = bindingScopeValues.Singleton;

    return new BindWhenOnFluentSyntaxImplementation(this.#binding);
  }

  public inTransientScope(): BindWhenOnFluentSyntax<T> {
    this.#binding.scope = bindingScopeValues.Transient;

    return new BindWhenOnFluentSyntaxImplementation(this.#binding);
  }
}

export class BindToFluentSyntaxImplementation<
  T,
> implements BindToFluentSyntax<T> {
  readonly #callback: (binding: Binding<T>) => void;
  readonly #containerModuleId: number | undefined;
  readonly #defaultScope: BindingScope;
  readonly #serviceIdentifier: ServiceIdentifier<T>;

  constructor(
    callback: (binding: Binding<T>) => void,
    containerModuleId: number | undefined,
    defaultScope: BindingScope,
    serviceIdentifier: ServiceIdentifier<T>,
  ) {
    this.#callback = callback;
    this.#containerModuleId = containerModuleId;
    this.#defaultScope = defaultScope;
    this.#serviceIdentifier = serviceIdentifier;
  }

  public to(type: Newable<T>): BindInWhenOnFluentSyntax<T> {
    const classMetadata: ClassMetadata = getClassMetadata(type);

    const binding: InstanceBinding<T> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: getBindingId(),
      implementationType: type,
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: classMetadata.scope ?? this.#defaultScope,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.Instance,
    };

    this.#callback(binding);

    return new BindInWhenOnFluentSyntaxImplementation<T>(binding);
  }

  public toSelf(): BindInWhenOnFluentSyntax<T> {
    if (typeof this.#serviceIdentifier !== 'function') {
      throw new Error(
        '"toSelf" function can only be applied when a newable function is used as service identifier',
      );
    }

    return this.to(this.#serviceIdentifier as Newable<T>);
  }

  public toConstantValue(value: T): BindWhenOnFluentSyntax<T> {
    const binding: ConstantValueBinding<T> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.ConstantValue,
      value: value as Resolved<T>,
    };

    this.#callback(binding);

    return new BindWhenOnFluentSyntaxImplementation<T>(binding);
  }

  public toDynamicValue(
    builder: DynamicValueBuilder<T>,
  ): BindInWhenOnFluentSyntax<T> {
    const binding: DynamicValueBinding<T> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: this.#defaultScope,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.DynamicValue,
      value: builder,
    };

    this.#callback(binding);

    return new BindInWhenOnFluentSyntaxImplementation(binding);
  }

  public toResolvedValue(
    factory: () => T | Promise<T>,
  ): BindInWhenOnFluentSyntax<T>;
  public toResolvedValue<TArgs extends unknown[]>(
    factory: (...args: TArgs) => T | Promise<T>,
    injectOptions: MapToResolvedValueInjectOptions<TArgs>,
  ): BindInWhenOnFluentSyntax<T>;
  public toResolvedValue<TArgs extends unknown[]>(
    factory: (...args: TArgs) => T | Promise<T>,
    injectOptions?: MapToResolvedValueInjectOptions<TArgs>,
  ): BindInWhenOnFluentSyntax<T> {
    const binding: ResolvedValueBinding<T> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory,
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      metadata: this.#buildResolvedValueMetadata(injectOptions),
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: this.#defaultScope,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.ResolvedValue,
    };

    this.#callback(binding);

    return new BindInWhenOnFluentSyntaxImplementation(binding);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public toFactory<T extends Factory<unknown, any>>(
    this: BindToFluentSyntaxImplementation<T>,
    builder: (context: ResolutionContext) => T | Promise<T>,
  ): BindWhenOnFluentSyntax<T> {
    const binding: FactoryBinding<Factory<unknown>> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: builder,
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.Factory,
    };

    this.#callback(binding as Binding as Binding<T>);

    return new BindWhenOnFluentSyntaxImplementation<T>(
      binding as Writable<ScopedBinding<BindingType, BindingScope, T>>,
    );
  }

  /**
   * @deprecated Use `toFactory()` instead. Providers will be removed in v8.
   * Providers exist for historical reasons from v5 when async dependencies weren't supported.
   * Factories are more flexible and can handle both sync and async operations.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-deprecated
  public toProvider<T extends Provider<unknown, any>>(
    this: BindToFluentSyntaxImplementation<T>,
    provider: (context: ResolutionContext) => T,
  ): BindWhenOnFluentSyntax<T> {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const binding: ProviderBinding<Provider<unknown>> = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      onActivation: undefined,
      onDeactivation: undefined,
      provider,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: this.#serviceIdentifier,
      type: bindingTypeValues.Provider,
    };

    this.#callback(binding as Binding as Binding<T>);

    return new BindWhenOnFluentSyntaxImplementation<T>(
      binding as Writable<ScopedBinding<BindingType, BindingScope, T>>,
    );
  }

  public toService(service: ServiceIdentifier<T>): void {
    const binding: ServiceRedirectionBinding<T> = {
      id: getBindingId(),
      isSatisfiedBy: BindingConstraintUtils.always,
      moduleId: this.#containerModuleId,
      serviceIdentifier: this.#serviceIdentifier,
      targetServiceIdentifier: service,
      type: bindingTypeValues.ServiceRedirection,
    };

    this.#callback(binding);
  }

  #buildResolvedValueMetadata(
    options: ResolvedValueInjectOptions<unknown>[] | undefined,
  ): ResolvedValueMetadata {
    const resolvedValueMetadata: ResolvedValueMetadata = {
      arguments: (options ?? []).map(
        (
          injectOption: ResolvedValueInjectOptions<unknown>,
        ): ResolvedValueElementMetadata => {
          if (isResolvedValueMetadataInjectOptions(injectOption)) {
            if (isMultipleResolvedValueMetadataInjectOptions(injectOption)) {
              return {
                chained: injectOption.chained ?? false,
                kind: ResolvedValueElementMetadataKind.multipleInjection,
                name: injectOption.name,
                optional:
                  (
                    injectOption as Partial<
                      OptionalResolvedValueMetadataInjectOptions<unknown>
                    >
                  ).optional ?? false,
                tags: new Map<MetadataTag, unknown>(
                  (injectOption.tags ?? []).map(
                    (tag: ResolvedValueMetadataInjectTagOptions) => [
                      tag.key,
                      tag.value,
                    ],
                  ),
                ),
                value: injectOption.serviceIdentifier,
              };
            } else {
              return {
                kind: ResolvedValueElementMetadataKind.singleInjection,
                name: injectOption.name,
                optional:
                  (
                    injectOption as Partial<
                      OptionalResolvedValueMetadataInjectOptions<unknown>
                    >
                  ).optional ?? false,
                tags: new Map<MetadataTag, unknown>(
                  (injectOption.tags ?? []).map(
                    (tag: ResolvedValueMetadataInjectTagOptions) => [
                      tag.key,
                      tag.value,
                    ],
                  ),
                ),
                value: injectOption.serviceIdentifier,
              };
            }
          } else {
            return {
              kind: ResolvedValueElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: injectOption,
            };
          }
        },
      ),
    };

    return resolvedValueMetadata;
  }
}

export class BindOnFluentSyntaxImplementation<
  T,
> implements BindOnFluentSyntax<T> {
  readonly #binding: Writable<ScopedBinding<BindingType, BindingScope, T>>;

  constructor(binding: Writable<ScopedBinding<BindingType, BindingScope, T>>) {
    this.#binding = binding;
  }

  public getIdentifier(): BindingIdentifier {
    return buildBindingIdentifier(this.#binding);
  }

  public onActivation(
    activation: BindingActivation<T>,
  ): BindWhenFluentSyntax<T> {
    this.#binding.onActivation = activation;

    return new BindWhenFluentSyntaxImplementation(this.#binding);
  }

  public onDeactivation(
    deactivation: BindingDeactivation<T>,
  ): BindWhenFluentSyntax<T> {
    this.#binding.onDeactivation = deactivation;

    if (this.#binding.scope !== bindingScopeValues.Singleton) {
      throw new InversifyContainerError(
        InversifyContainerErrorKind.invalidOperation,
        `Binding for service "${stringifyServiceIdentifier(this.#binding.serviceIdentifier)}" has a deactivation function, but its scope is not singleton. Deactivation functions can only be used with singleton bindings.`,
      );
    }

    return new BindWhenFluentSyntaxImplementation(this.#binding);
  }
}

export class BindWhenFluentSyntaxImplementation<
  T,
> implements BindWhenFluentSyntax<T> {
  readonly #binding: Writable<ScopedBinding<BindingType, BindingScope, T>>;

  constructor(binding: Writable<ScopedBinding<BindingType, BindingScope, T>>) {
    this.#binding = binding;
  }

  public getIdentifier(): BindingIdentifier {
    return buildBindingIdentifier(this.#binding);
  }

  public when(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T> {
    this.#binding.isSatisfiedBy = constraint;

    return new BindOnFluentSyntaxImplementation(this.#binding);
  }

  public whenAnyAncestor(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T> {
    return this.when(isAnyAncestorBindingConstraints(constraint));
  }

  public whenAnyAncestorIs(
    serviceIdentifier: ServiceIdentifier,
  ): BindOnFluentSyntax<T> {
    return this.when(
      isAnyAncestorBindingConstraintsWithServiceId(serviceIdentifier),
    );
  }

  public whenAnyAncestorNamed(name: MetadataName): BindOnFluentSyntax<T> {
    return this.when(isAnyAncestorBindingConstraintsWithName(name));
  }

  public whenAnyAncestorTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T> {
    return this.when(isAnyAncestorBindingConstraintsWithTag(tag, tagValue));
  }

  public whenDefault(): BindOnFluentSyntax<T> {
    return this.when(isBindingConstraintsWithNoNameNorTags);
  }

  public whenNamed(name: MetadataName): BindOnFluentSyntax<T> {
    return this.when(isBindingConstraintsWithName(name));
  }

  public whenNoParent(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T> {
    return this.when(isNotParentBindingConstraints(constraint));
  }

  public whenNoParentIs(
    serviceIdentifier: ServiceIdentifier,
  ): BindOnFluentSyntax<T> {
    return this.when(
      isNotParentBindingConstraintsWithServiceId(serviceIdentifier),
    );
  }

  public whenNoParentNamed(name: MetadataName): BindOnFluentSyntax<T> {
    return this.when(isNotParentBindingConstraintsWithName(name));
  }

  public whenNoParentTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T> {
    return this.when(isNotParentBindingConstraintsWithTag(tag, tagValue));
  }

  public whenParent(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T> {
    return this.when(isParentBindingConstraints(constraint));
  }

  public whenParentIs(
    serviceIdentifier: ServiceIdentifier,
  ): BindOnFluentSyntax<T> {
    return this.when(
      isParentBindingConstraintsWithServiceId(serviceIdentifier),
    );
  }

  public whenParentNamed(name: MetadataName): BindOnFluentSyntax<T> {
    return this.when(isParentBindingConstraintsWithName(name));
  }

  public whenParentTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T> {
    return this.when(isParentBindingConstraintsWithTag(tag, tagValue));
  }

  public whenTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T> {
    return this.when(isBindingConstraintsWithTag(tag, tagValue));
  }

  public whenNoAncestor(
    constraint: (metadata: BindingConstraints) => boolean,
  ): BindOnFluentSyntax<T> {
    return this.when(isNoAncestorBindingConstraints(constraint));
  }

  public whenNoAncestorIs(
    serviceIdentifier: ServiceIdentifier,
  ): BindOnFluentSyntax<T> {
    return this.when(
      isNoAncestorBindingConstraintsWithServiceId(serviceIdentifier),
    );
  }

  public whenNoAncestorNamed(name: MetadataName): BindOnFluentSyntax<T> {
    return this.when(isNoAncestorBindingConstraintsWithName(name));
  }

  public whenNoAncestorTagged(
    tag: MetadataTag,
    tagValue: unknown,
  ): BindOnFluentSyntax<T> {
    return this.when(isNoAncestorBindingConstraintsWithTag(tag, tagValue));
  }
}

export class BindWhenOnFluentSyntaxImplementation<T>
  extends BindWhenFluentSyntaxImplementation<T>
  implements BindWhenOnFluentSyntax<T>
{
  readonly #bindOnFluentSyntax: BindOnFluentSyntax<T>;

  constructor(binding: Writable<ScopedBinding<BindingType, BindingScope, T>>) {
    super(binding);

    this.#bindOnFluentSyntax = new BindOnFluentSyntaxImplementation(binding);
  }

  public onActivation(
    activation: BindingActivation<T>,
  ): BindWhenFluentSyntax<T> {
    return this.#bindOnFluentSyntax.onActivation(activation);
  }

  public onDeactivation(
    deactivation: BindingDeactivation<T>,
  ): BindWhenFluentSyntax<T> {
    return this.#bindOnFluentSyntax.onDeactivation(deactivation);
  }
}

export class BindInWhenOnFluentSyntaxImplementation<T>
  extends BindWhenOnFluentSyntaxImplementation<T>
  implements BindInWhenOnFluentSyntax<T>
{
  readonly #bindInFluentSyntax: BindInFluentSyntax<T>;

  constructor(binding: Writable<ScopedBinding<BindingType, BindingScope, T>>) {
    super(binding);

    this.#bindInFluentSyntax = new BindInFluentSyntaxImplementation(binding);
  }

  public inRequestScope(): BindWhenOnFluentSyntax<T> {
    return this.#bindInFluentSyntax.inRequestScope();
  }

  public inSingletonScope(): BindWhenOnFluentSyntax<T> {
    return this.#bindInFluentSyntax.inSingletonScope();
  }

  public inTransientScope(): BindWhenOnFluentSyntax<T> {
    return this.#bindInFluentSyntax.inTransientScope();
  }
}
