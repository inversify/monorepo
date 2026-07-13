import { isPromise } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';

export function resolveBindingActivationsFromIterator<TActivated>(
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
