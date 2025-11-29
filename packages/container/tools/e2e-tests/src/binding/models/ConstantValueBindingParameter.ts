import { BaseBindingParameter } from './BaseBindingParameter';
import { BindingParameterKind } from './BindingParameterKind';

export interface ConstantValueBindingParameter extends BaseBindingParameter<BindingParameterKind.constantValue> {
  value: unknown;
}
