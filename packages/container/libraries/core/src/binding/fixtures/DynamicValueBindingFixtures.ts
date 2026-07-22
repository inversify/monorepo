import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type DynamicValueBinding } from '../models/DynamicValueBinding.js';

export class DynamicValueBindingFixtures {
  public static get any(): DynamicValueBinding<unknown> {
    return {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.DynamicValue,
      value: () => Symbol(),
    };
  }

  public static get withScopeSingleton(): DynamicValueBinding<unknown> {
    return {
      ...DynamicValueBindingFixtures.any,
      scope: bindingScopeValues.Singleton,
    };
  }

  public static get withScopeTransient(): DynamicValueBinding<unknown> {
    return {
      ...DynamicValueBindingFixtures.any,
      scope: bindingScopeValues.Transient,
    };
  }

  public static get withOnActivation(): DynamicValueBinding<unknown> {
    return {
      ...DynamicValueBindingFixtures.any,
      onActivation: () => undefined,
    };
  }
}
