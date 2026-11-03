import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { type BindingParameter } from '../models/BindingParameter';

export function getBindingOrFail(
  this: InversifyWorld,
  alias: string,
): BindingParameter {
  const binding: BindingParameter | undefined =
    this.entities.bindings.get(alias);

  if (binding === undefined) {
    throw new Error(`Expected "${alias}" aliased binding not found`);
  }

  return binding;
}
