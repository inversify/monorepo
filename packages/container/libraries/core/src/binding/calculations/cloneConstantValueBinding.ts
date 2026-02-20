import { type ConstantValueBinding } from '../models/ConstantValueBinding.js';
import { cloneBindingCache } from './cloneBindingCache.js';

/**
 * Clones a ConstantValueBinding
 */
export function cloneConstantValueBinding<TActivated>(
  binding: ConstantValueBinding<TActivated>,
): ConstantValueBinding<TActivated> {
  return {
    cache: cloneBindingCache(binding.cache),
    id: binding.id,
    isSatisfiedBy: binding.isSatisfiedBy,
    moduleId: binding.moduleId,
    onActivation: binding.onActivation,
    onDeactivation: binding.onDeactivation,
    scope: binding.scope,
    serviceIdentifier: binding.serviceIdentifier,
    type: binding.type,
    // The value is not cloned as it's a resolved value
    value: binding.value,
  };
}
