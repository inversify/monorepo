import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type ConstantValueBinding } from '../models/ConstantValueBinding.js';

export class ConstantValueBindingFixtures {
  public static get any(): ConstantValueBinding<unknown> {
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
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol.for('constant-value-binding-fixture-value'),
    };
  }

  public static get withCacheWithIsRightFalse(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      cache: {
        isRight: false,
        value: undefined,
      },
    };
  }

  public static get withCacheWithIsRightTrue(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      cache: {
        isRight: true,
        value: Symbol.for('constant-value-binding-fixture-value'),
      },
    };
  }

  public static get withOnActivationUndefined(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      onActivation: undefined,
    };
  }

  public static get withCacheWithIsRightTrueOnDeactivationAsync(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      onDeactivation: async (): Promise<void> => undefined,
    };
  }

  public static get withCacheWithIsRightTrueAndAsyncValueAndOnDeactivationSync(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      cache: {
        isRight: true,
        value: Promise.resolve(Symbol()),
      },
      onDeactivation: (): void => undefined,
    };
  }

  public static get withCacheWithIsRightTrueAndOnDeactivationSync(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.withCacheWithIsRightTrue,
      onDeactivation: (): void => undefined,
    };
  }

  public static get withCacheWithIsRightTrueAndOnDeactivationUndefined(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.withCacheWithIsRightTrue,
      onDeactivation: undefined,
    };
  }

  public static get withModuleIdUndefined(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      moduleId: undefined,
    };
  }

  public static get withModuleId(): ConstantValueBinding<unknown> {
    return {
      ...ConstantValueBindingFixtures.any,
      moduleId: 1,
    };
  }
}
