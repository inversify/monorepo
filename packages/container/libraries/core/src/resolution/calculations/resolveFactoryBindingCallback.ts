import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveFactoryBindingCallback<
  TActivated extends Factory<unknown>,
>(
  params: ResolutionParams,
  binding: FactoryBinding<TActivated>,
): TActivated | Promise<TActivated> {
  return binding.factory(params.context);
}
