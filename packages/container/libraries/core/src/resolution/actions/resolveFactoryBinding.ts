import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { resolveFactoryBindingCallback } from '../calculations/resolveFactoryBindingCallback.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveSingletonScopedBinding } from './resolveSingletonScopedBinding.js';

export const resolveFactoryBinding: <TActivated extends Factory<unknown>>(
  params: ResolutionParams,
  binding: FactoryBinding<TActivated>,
) => Resolved<TActivated> = resolveSingletonScopedBinding<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  typeof bindingTypeValues.Factory,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FactoryBinding<any>
>(resolveFactoryBindingCallback);
