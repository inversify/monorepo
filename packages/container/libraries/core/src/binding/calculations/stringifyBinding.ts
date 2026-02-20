import { stringifyServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../models/Binding.js';
import { bindingTypeValues } from '../models/BindingType.js';

export function stringifyBinding(binding: Binding): string {
  switch (binding.type) {
    case bindingTypeValues.Instance:
      return `[ type: "${binding.type}", serviceIdentifier: "${stringifyServiceIdentifier(binding.serviceIdentifier)}", scope: "${binding.scope}", implementationType: "${binding.implementationType.name}" ]`;
    case bindingTypeValues.ServiceRedirection:
      return `[ type: "${binding.type}", serviceIdentifier: "${stringifyServiceIdentifier(binding.serviceIdentifier)}", redirection: "${stringifyServiceIdentifier(binding.targetServiceIdentifier)}" ]`;
    default:
      return `[ type: "${binding.type}", serviceIdentifier: "${stringifyServiceIdentifier(binding.serviceIdentifier)}", scope: "${binding.scope}" ]`;
  }
}
