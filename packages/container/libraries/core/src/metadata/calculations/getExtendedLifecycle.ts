import { ClassMetadata } from '../models/ClassMetadata';
import { ClassMetadataLifecycle } from '../models/ClassMetadataLifecycle';
import { InjectFromOptions } from '../models/InjectFromOptions';

function getLifecycleSetUnion<T>(
  extend: boolean,
  baseSet: Set<T>,
  currentSet: Set<T>,
): Set<T> {
  if (extend) {
    return new Set([...baseSet, ...currentSet]);
  }

  return currentSet;
}

export function getExtendedLifecycle(
  options: InjectFromOptions,
  baseTypeClassMetadata: ClassMetadata,
  typeMetadata: ClassMetadata,
): ClassMetadataLifecycle {
  const extendPostConstructMethods: boolean =
    options.lifecycle?.extendPostConstructMethods ?? true;
  const extendPreDestroyMethods: boolean =
    options.lifecycle?.extendPreDestroyMethods ?? true;

  const preDestroyMethodNames: Set<string | symbol> = getLifecycleSetUnion(
    extendPreDestroyMethods,
    baseTypeClassMetadata.lifecycle.preDestroyMethodNames,
    typeMetadata.lifecycle.preDestroyMethodNames,
  );

  const postConstructMethodNames: Set<string | symbol> = getLifecycleSetUnion(
    extendPostConstructMethods,
    baseTypeClassMetadata.lifecycle.postConstructMethodNames,
    typeMetadata.lifecycle.postConstructMethodNames,
  );

  return {
    postConstructMethodNames,
    preDestroyMethodNames,
  };
}
