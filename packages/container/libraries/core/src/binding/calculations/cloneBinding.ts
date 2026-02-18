import { type Binding } from '../models/Binding.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type Factory } from '../models/Factory.js';
import { type FactoryBinding } from '../models/FactoryBinding.js';
import { cloneConstantValueBinding } from './cloneConstantValueBinding.js';
import { cloneDynamicValueBinding } from './cloneDynamicValueBinding.js';
import { cloneFactoryBinding } from './cloneFactoryBinding.js';
import { cloneInstanceBinding } from './cloneInstanceBinding.js';
import { cloneResolvedValueBinding } from './cloneResolvedValueBinding.js';
import { cloneServiceRedirectionBinding } from './cloneServiceRedirectionBinding.js';

/**
 * Creates a deep clone of a binding.
 *
 * @param binding - The binding to clone
 * @returns A clone of the binding
 */
export function cloneBinding<TActivated>(
  binding: Binding<TActivated>,
): Binding<TActivated> {
  // Switch based on binding type to delegate to specific clone functions
  switch (binding.type) {
    case bindingTypeValues.ConstantValue:
      return cloneConstantValueBinding(binding);
    case bindingTypeValues.DynamicValue:
      return cloneDynamicValueBinding(binding);
    case bindingTypeValues.Factory:
      return cloneFactoryBinding(
        binding as FactoryBinding<TActivated & Factory<unknown>>,
      ) as Binding<TActivated>;
    case bindingTypeValues.Instance:
      return cloneInstanceBinding(binding);
    case bindingTypeValues.ResolvedValue:
      return cloneResolvedValueBinding(binding);
    case bindingTypeValues.ServiceRedirection:
      return cloneServiceRedirectionBinding(binding);
  }
}
