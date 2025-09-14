import { isPromise } from '@inversifyjs/common';

import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { Resolved, SyncResolved } from '../models/Resolved';

export function resolvePostConstruct<TActivated>(
  instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
  binding: InstanceBinding<TActivated>,
  postConstructMethodName: string | symbol,
): Resolved<TActivated> {
  const postConstructResult: void | Promise<void> = invokePostConstruct(
    instance,
    binding,
    postConstructMethodName,
  );

  if (isPromise(postConstructResult)) {
    return postConstructResult.then(() => instance);
  }

  return instance;
}

function invokePostConstruct<TActivated>(
  instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
  binding: InstanceBinding<TActivated>,
  postConstructMethodName: string | symbol,
): void | Promise<void> {
  if (postConstructMethodName in instance) {
    if (typeof instance[postConstructMethodName] === 'function') {
      let postConstructResult: unknown;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        postConstructResult = instance[postConstructMethodName]();
      } catch (error: unknown) {
        throw new InversifyCoreError(
          InversifyCoreErrorKind.resolution,
          `Unexpected error found when calling "${postConstructMethodName.toString()}" @postConstruct decorated method on class "${binding.implementationType.name}"`,
          {
            cause: error,
          },
        );
      }

      if (isPromise(postConstructResult)) {
        return invokePostConstructAsync(
          binding,
          postConstructMethodName,
          postConstructResult,
        );
      }
    } else {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.resolution,
        `Expecting a "${postConstructMethodName.toString()}" method when resolving "${binding.implementationType.name}" class @postConstruct decorated method, a non function property was found instead.`,
      );
    }
  } else {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.resolution,
      `Expecting a "${postConstructMethodName.toString()}" property when resolving "${binding.implementationType.name}" class @postConstruct decorated method, none found.`,
    );
  }
}

async function invokePostConstructAsync<TActivated>(
  binding: InstanceBinding<TActivated>,
  postConstructMethodName: string | symbol,
  postConstructResult: Promise<unknown>,
): Promise<void> {
  try {
    await postConstructResult;
  } catch (error: unknown) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.resolution,
      `Unexpected error found when calling "${postConstructMethodName.toString()}" @postConstruct decorated method on class "${binding.implementationType.name}"`,
      {
        cause: error,
      },
    );
  }
}
