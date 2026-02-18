import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type ResolvedValueBinding } from '../models/ResolvedValueBinding.js';

export class ResolvedValueBindingFixtures {
  public static get any(): ResolvedValueBinding<unknown> {
    return {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: () => Symbol(),
      id: 1,
      isSatisfiedBy: () => true,
      metadata: {
        arguments: [],
      },
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.ResolvedValue,
    };
  }

  public static get withSingleInjectionMetadata(): ResolvedValueBinding<unknown> {
    return {
      ...ResolvedValueBindingFixtures.any,
      metadata: {
        arguments: [
          {
            kind: ResolvedValueElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: Symbol(),
          },
        ],
      },
    };
  }
}
