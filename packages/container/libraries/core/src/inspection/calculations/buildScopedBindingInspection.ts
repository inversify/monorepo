import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type ScopedBinding } from '../../binding/models/ScopedBinding.js';
import { type ScopedBindingInspection } from '../models/ScopedBindingInspection.js';

export function buildScopedBindingInspection<
  TType extends BindingType,
  TScope extends BindingScope,
>(
  binding: ScopedBinding<TType, TScope, unknown>,
): ScopedBindingInspection<TType, TScope> {
  return {
    id: binding.id,
    moduleId: binding.moduleId,
    scope: binding.scope,
    serviceIdentifier: binding.serviceIdentifier,
    type: binding.type,
  };
}
