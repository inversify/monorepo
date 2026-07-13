import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type SyncResolved } from '../models/Resolved.js';

export async function resolveBindingActivationsFromIteratorAsync<TActivated>(
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
