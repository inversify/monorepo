import {
  type BindingIdentifier,
  bindingIdentifierSymbol,
} from '../models/BindingIdentifier.js';

export function isBindingIdentifier(
  value: unknown,
): value is BindingIdentifier {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<BindingIdentifier>)[bindingIdentifierSymbol] === true
  );
}
