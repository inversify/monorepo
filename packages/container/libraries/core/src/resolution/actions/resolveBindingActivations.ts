import { isPromise } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';
import { resolveBindingServiceActivations } from './resolveBindingServiceActivations.js';

export function resolveBindingActivations<TActivated>(
  params: ResolutionParams,
  binding: ScopedBinding<BindingType, BindingScope, TActivated>,
  value: Resolved<TActivated>,
): Resolved<TActivated> {
  let activationResult: TActivated | Promise<TActivated> = value;

  if (binding.onActivation !== undefined) {
    const onActivation: BindingActivation<TActivated> = binding.onActivation;

    if (isPromise(activationResult)) {
      activationResult = activationResult.then(
        (resolved: SyncResolved<TActivated>): Resolved<TActivated> =>
          onActivation(params.context, resolved),
      );
    } else {
      activationResult = onActivation(params.context, activationResult);
    }
  }

  return resolveBindingServiceActivations<TActivated>(
    params,
    binding.serviceIdentifier,
    activationResult,
  );
}
