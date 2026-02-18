import { type Newable } from '@inversifyjs/common';

import { getClassMetadata } from '../../metadata/calculations/getClassMetadata.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { getBindingId } from '../actions/getBindingId.js';
import { type AutobindOptions } from '../models/AutobindOptions.js';
import { type BindingScope } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type InstanceBinding } from '../models/InstanceBinding.js';

export function buildInstanceBinding<TResolved = unknown>(
  autobindOptions: AutobindOptions,
  serviceIdentifier: Newable<TResolved>,
): InstanceBinding<TResolved> {
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
