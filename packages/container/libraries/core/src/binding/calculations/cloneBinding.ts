import { Binding } from '../models/Binding';
import { bindingTypeValues } from '../models/BindingType';
import { Factory } from '../models/Factory';
import { FactoryBinding } from '../models/FactoryBinding';
import { Provider } from '../models/Provider';
import { ProviderBinding } from '../models/ProviderBinding';
import { cloneConstantValueBinding } from './cloneConstantValueBinding';
import { cloneDynamicValueBinding } from './cloneDynamicValueBinding';
import { cloneFactoryBinding } from './cloneFactoryBinding';
import { cloneInstanceBinding } from './cloneInstanceBinding';
import { cloneProviderBinding } from './cloneProviderBinding';
import { cloneResolvedValueBinding } from './cloneResolvedValueBinding';
import { cloneServiceRedirectionBinding } from './cloneServiceRedirectionBinding';

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
    case bindingTypeValues.Provider:
      return cloneProviderBinding(
        binding as ProviderBinding<TActivated & Provider<unknown>>, // eslint-disable-line @typescript-eslint/no-deprecated
      ) as Binding<TActivated>;
    case bindingTypeValues.ResolvedValue:
      return cloneResolvedValueBinding(binding);
    case bindingTypeValues.ServiceRedirection:
      return cloneServiceRedirectionBinding(binding);
  }
}
