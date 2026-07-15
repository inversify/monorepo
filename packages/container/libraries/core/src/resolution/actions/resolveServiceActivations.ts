import { isPromise, type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveBindingActivationsFromIterator } from './resolveBindingActivationsFromIterator.js';
import { resolveBindingActivationsFromIteratorAsync } from './resolveBindingActivationsFromIteratorAsync.js';

export function resolveServiceActivations<TActivated>(
  serviceIdentifier: ServiceIdentifier<TActivated>,
): (
  params: ResolutionParams,
  value: Resolved<TActivated>,
) => Resolved<TActivated> {
  return (
    params: ResolutionParams,
    value: Resolved<TActivated>,
  ): Resolved<TActivated> => {
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
  };
}
