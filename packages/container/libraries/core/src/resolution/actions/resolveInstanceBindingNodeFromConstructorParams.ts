import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';
import { resolvePostConstruct } from './resolvePostConstruct.js';

function resolveAllPostConstructMethods<TActivated>(
  instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
  binding: InstanceBinding<TActivated>,
  postConstructMethodNames: Set<string | symbol>,
): Resolved<TActivated> {
  if (postConstructMethodNames.size === 0) {
    return instance;
  }

  let result: Resolved<TActivated> = instance;

  for (const methodName of postConstructMethodNames) {
    if (isPromise<TActivated>(result)) {
      result = result.then<TActivated>(
        (resolvedInstance: TActivated): Resolved<TActivated> =>
          resolvePostConstruct(
            resolvedInstance as TActivated & Record<string | symbol, unknown>,
            binding,
            methodName,
          ),
      );
    } else {
      result = resolvePostConstruct(
        result as SyncResolved<TActivated> & Record<string | symbol, unknown>,
        binding,
        methodName,
      );
    }
  }

  return result;
}

export function resolveInstanceBindingNodeFromConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  setInstanceProperties: (
    params: ResolutionParams,
    instance: Record<string | symbol, unknown>,
    node: InstanceBindingNode,
  ) => void | Promise<void>,
): (
  constructorValues: unknown[],
  params: ResolutionParams,
  node: InstanceBindingNode<TBinding>,
) => Resolved<TActivated> {
  return (
    constructorValues: unknown[],
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ): Resolved<TActivated> => {
    const instance: SyncResolved<TActivated> &
      Record<string | symbol, unknown> = new node.binding.implementationType(
      ...constructorValues,
    ) as SyncResolved<TActivated> & Record<string | symbol, unknown>;

    const propertiesAssignmentResult: void | Promise<void> =
      setInstanceProperties(params, instance, node);

    if (isPromise(propertiesAssignmentResult)) {
      return propertiesAssignmentResult.then(
        (): Resolved<TActivated> =>
          resolveAllPostConstructMethods(
            instance,
            node.binding,
            node.classMetadata.lifecycle.postConstructMethodNames,
          ),
      );
    }

    return resolveAllPostConstructMethods(
      instance,
      node.binding,
      node.classMetadata.lifecycle.postConstructMethodNames,
    );
  };
}
