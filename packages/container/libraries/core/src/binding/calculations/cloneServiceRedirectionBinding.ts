import { type ServiceRedirectionBinding } from '../models/ServiceRedirectionBinding.js';

/**
 * Clones a ServiceRedirectionBinding
 */
export function cloneServiceRedirectionBinding<TActivated>(
  binding: ServiceRedirectionBinding<TActivated>,
): ServiceRedirectionBinding<TActivated> {
  return {
    id: binding.id,
    isSatisfiedBy: binding.isSatisfiedBy,
    moduleId: binding.moduleId,
    serviceIdentifier: binding.serviceIdentifier,
    targetServiceIdentifier: binding.targetServiceIdentifier,
    type: binding.type,
  };
}
