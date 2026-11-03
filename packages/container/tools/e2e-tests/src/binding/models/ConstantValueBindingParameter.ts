import { type BaseBindingParameter } from './BaseBindingParameter';
import { type BindingParameterKind } from './BindingParameterKind';

export interface ConstantValueBindingParameter extends BaseBindingParameter<BindingParameterKind.constantValue> {
  value: unknown;
}
