import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { Resolved } from '../models/Resolved';

export function resolveConstantValueBindingCallback<TActivated>(
  _params: ResolutionParams,
  binding: ConstantValueBinding<TActivated>,
): Resolved<TActivated> {
  return binding.value;
}
