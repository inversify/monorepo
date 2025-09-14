import { isPromise, Right } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import {
  BindingType,
  bindingTypeValues,
} from '../../binding/models/BindingType';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { DeactivationParams } from '../models/DeactivationParams';
import { Resolved } from '../models/Resolved';

const CACHE_KEY_TYPE: keyof ScopedBinding<
  BindingType,
  typeof bindingScopeValues.Singleton,
  unknown
> = 'cache';

type CachedSingletonScopedBinding<TResolved> = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, TResolved> & {
    [CACHE_KEY_TYPE]: Right<Resolved<TResolved>>;
  };

export function resolveBindingPreDestroy<TResolved>(
  params: DeactivationParams,
  binding: CachedSingletonScopedBinding<TResolved>,
): void | Promise<void> {
  if (binding.type === bindingTypeValues.Instance) {
    const classMetadata: ClassMetadata = params.getClassMetadata(
      binding.implementationType,
    );

    const instance: Resolved<Record<string | symbol, unknown>> = binding.cache
      .value as Resolved<Record<string | symbol, unknown>>;

    if (isPromise(instance)) {
      return instance.then(
        (instance: Record<string | symbol, unknown>): void | Promise<void> =>
          resolveInstancePreDestroyMethods(classMetadata, instance),
      );
    } else {
      return resolveInstancePreDestroyMethods(classMetadata, instance);
    }
  }
}

function resolveInstancePreDestroyMethod(
  instance: Record<string | symbol, unknown>,
  methodName: string | symbol,
): void | Promise<void> {
  if (typeof instance[methodName] === 'function') {
    const result: void | Promise<void> = (
      instance[methodName] as () => void | Promise<void>
    )();

    return result;
  }
}

function resolveInstancePreDestroyMethods(
  classMetadata: ClassMetadata,
  instance: Record<string | symbol, unknown>,
): void | Promise<void> {
  const preDestroyMethodNames: Set<string | symbol> =
    classMetadata.lifecycle.preDestroyMethodNames;

  if (preDestroyMethodNames.size === 0) {
    return;
  }

  let result: void | Promise<void> = undefined;

  for (const methodName of preDestroyMethodNames) {
    if (result === undefined) {
      result = resolveInstancePreDestroyMethod(instance, methodName);
    } else {
      result = result.then((): void | Promise<void> =>
        resolveInstancePreDestroyMethod(instance, methodName),
      );
    }
  }

  return result;
}
