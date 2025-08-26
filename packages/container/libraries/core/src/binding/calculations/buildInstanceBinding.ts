import { Newable } from '@inversifyjs/common';

import { getClassMetadata } from '../../metadata/calculations/getClassMetadata';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { BasePlanParamsAutobindOptions } from '../../planning/models/BasePlanParamsAutobindOptions';
import { getBindingId } from '../actions/getBindingId';
import { BindingScope } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { InstanceBinding } from '../models/InstanceBinding';

export function buildInstanceBinding(
  autobindOptions: BasePlanParamsAutobindOptions,
  serviceIdentifier: Newable,
): InstanceBinding<unknown> {
  const classMetadata: ClassMetadata = getClassMetadata(serviceIdentifier);
  const scope: BindingScope = classMetadata.scope ?? autobindOptions.scope;

  return {
    cache: {
      isRight: false,
      value: undefined,
    },
    id: getBindingId(),
    implementationType: serviceIdentifier,
    isSatisfiedBy: () => true,
    moduleId: undefined,
    onActivation: undefined,
    onDeactivation: undefined,
    scope,
    serviceIdentifier,
    type: bindingTypeValues.Instance,
  };
}
