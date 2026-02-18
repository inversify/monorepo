import { type Binding } from '../../binding/models/Binding.js';
import { type DeactivationParams } from '../models/DeactivationParams.js';
import { resolveBindingsDeactivations } from './resolveBindingsDeactivations.js';

export function resolveModuleDeactivations(
  params: DeactivationParams,
  moduleId: number,
): void | Promise<void> {
  const bindings: Iterable<Binding> | undefined =
    params.getBindingsFromModule(moduleId);

  return resolveBindingsDeactivations(params, bindings);
}
