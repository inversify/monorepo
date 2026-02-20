import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { resolveConstantValueBindingCallback } from '../calculations/resolveConstantValueBindingCallback.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveSingletonScopedBinding } from './resolveSingletonScopedBinding.js';

export const resolveConstantValueBinding: <TActivated>(
  params: ResolutionParams,
  binding: ConstantValueBinding<TActivated>,
) => Resolved<TActivated> = resolveSingletonScopedBinding<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  typeof bindingTypeValues.ConstantValue,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ConstantValueBinding<any>
>(resolveConstantValueBindingCallback);
