import { isPromise, type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';

export function resolveBindingServiceActivations<TActivated>(
  params: ResolutionParams,
  serviceIdentifier: ServiceIdentifier<TActivated>,
  value: Resolved<TActivated>,
): Resolved<TActivated> {
  const activations: Iterable<BindingActivation<TActivated>> | undefined =
    params.getActivations(serviceIdentifier);

  if (activations === undefined) {
    return value;
  }

  if (isPromise(value)) {
    return resolveBindingActivationsFromIteratorAsync(
      params,
      value,
      activations[Symbol.iterator](),
    );
  }

  return resolveBindingActivationsFromIterator(
    params,
    value,
    activations[Symbol.iterator](),
  );
}

function resolveBindingActivationsFromIterator<TActivated>(
  params: ResolutionParams,
  value: SyncResolved<TActivated>,
  activationsIterator: Iterator<BindingActivation<TActivated>>,
): Resolved<TActivated> {
  let activatedValue: SyncResolved<TActivated> = value;

  let activationIteratorResult: IteratorResult<BindingActivation<TActivated>> =
    activationsIterator.next();

  while (activationIteratorResult.done !== true) {
    const nextActivatedValue: Resolved<TActivated> =
      activationIteratorResult.value(params.context, activatedValue);

    if (isPromise(nextActivatedValue)) {
      return resolveBindingActivationsFromIteratorAsync(
        params,
        nextActivatedValue,
        activationsIterator,
      );
    } else {
      activatedValue = nextActivatedValue;
    }

    activationIteratorResult = activationsIterator.next();
  }

  return activatedValue;
}

async function resolveBindingActivationsFromIteratorAsync<TActivated>(
  params: ResolutionParams,
  value: Promise<TActivated>,
  activationsIterator: Iterator<BindingActivation<TActivated>>,
): Promise<SyncResolved<TActivated>> {
  let activatedValue: SyncResolved<TActivated> = await value;

  let activationIteratorResult: IteratorResult<BindingActivation<TActivated>> =
    activationsIterator.next();

  while (activationIteratorResult.done !== true) {
    activatedValue = await activationIteratorResult.value(
      params.context,
      activatedValue,
    );

    activationIteratorResult = activationsIterator.next();
  }

  return activatedValue;
}
