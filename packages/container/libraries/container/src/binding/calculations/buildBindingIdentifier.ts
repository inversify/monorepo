import { type BaseBinding, type BindingType } from '@inversifyjs/core';

import {
  type BindingIdentifier,
  bindingIdentifierSymbol,
} from '../models/BindingIdentifier.js';

export function buildBindingIdentifier(
  binding: BaseBinding<BindingType, unknown>,
): BindingIdentifier {
  return {
    [bindingIdentifierSymbol]: true,
    id: binding.id,
  };
}
