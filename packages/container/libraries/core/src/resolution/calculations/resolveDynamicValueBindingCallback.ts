import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';

export function resolveDynamicValueBindingCallback<TActivated>(
  params: ResolutionParams,
  binding: DynamicValueBinding<TActivated>,
): Resolved<TActivated> {
  return binding.value(params.context);
}
