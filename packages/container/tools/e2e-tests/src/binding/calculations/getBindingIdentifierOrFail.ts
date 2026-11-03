import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { type BindingIdentifierParameter } from '../models/BindingIdentifierParameter';

export function getBindingIdentifierOrFail(
  this: InversifyWorld,
  alias: string,
): BindingIdentifierParameter {
  const binding: BindingIdentifierParameter | undefined =
    this.entities.bindingIdentifiers.get(alias);

  if (binding === undefined) {
    throw new Error(`Expected "${alias}" aliased binding identifier not found`);
  }

  return binding;
}
