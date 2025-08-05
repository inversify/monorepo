import { bindingTypeValues } from '../models/BindingType';
import { ServiceRedirectionBinding } from '../models/ServiceRedirectionBinding';

export class ServiceRedirectionBindingFixtures {
  public static get any(): ServiceRedirectionBinding<unknown> {
    return {
      id: 1,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      serviceIdentifier: Symbol(),
      targetServiceIdentifier: Symbol(),
      type: bindingTypeValues.ServiceRedirection,
    };
  }
}
