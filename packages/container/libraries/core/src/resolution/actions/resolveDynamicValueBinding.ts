import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveDynamicValueBindingCallback } from '../calculations/resolveDynamicValueBindingCallback.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveScopedBinding } from './resolveScopedBinding.js';

export const resolveDynamicValueBinding: <TActivated>(
  params: ResolutionParams,
  binding: DynamicValueBinding<TActivated>,
) => Resolved<TActivated> = resolveScopedBinding<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  typeof bindingTypeValues.DynamicValue,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DynamicValueBinding<any>
>(resolveDynamicValueBindingCallback);
