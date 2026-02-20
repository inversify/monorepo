import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type DeactivationParams } from '../models/DeactivationParams.js';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations.js';

export function resolveServiceDeactivations(
  params: DeactivationParams,
  serviceIdentifier: ServiceIdentifier,
): void | Promise<void> {
  const bindings: Iterable<Binding> | undefined =
    params.getBindings(serviceIdentifier);

  return resolveBindingsDeactivations(params, bindings);
}
