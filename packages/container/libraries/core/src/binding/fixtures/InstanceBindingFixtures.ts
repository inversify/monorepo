import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type InstanceBinding } from '../models/InstanceBinding.js';

export class InstanceBindingFixtures {
  public static get any(): InstanceBinding<unknown> {
    return {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      implementationType: class Foo {},
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.Instance,
    };
  }

  public static get withScopeSingleton(): InstanceBinding<unknown> {
    return {
      ...InstanceBindingFixtures.any,
      scope: bindingScopeValues.Singleton,
    };
  }

  public static get withCacheIsRightAndAsyncValueAndScopeSingleton(): InstanceBinding<unknown> {
    return {
      ...InstanceBindingFixtures.withScopeSingleton,
      cache: {
        isRight: true,
        value: Promise.resolve({}),
      },
    };
  }

  public static get withCacheIsRightAndScopeSingleton(): InstanceBinding<unknown> {
    return {
      ...InstanceBindingFixtures.withScopeSingleton,
      cache: {
        isRight: true,
        value: {},
      },
    };
  }
}
