import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';

export function resolveConstantValueBindingCallback<TActivated>(
  _params: ResolutionParams,
  binding: ConstantValueBinding<TActivated>,
): Resolved<TActivated> {
  return binding.value;
}
