import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { ResolutionParams } from '../models/ResolutionParams';

export function resolveFactoryBindingCallback<
  TActivated extends Factory<unknown>,
>(
  params: ResolutionParams,
  binding: FactoryBinding<TActivated>,
): TActivated | Promise<TActivated> {
  return binding.factory(params.context);
}
