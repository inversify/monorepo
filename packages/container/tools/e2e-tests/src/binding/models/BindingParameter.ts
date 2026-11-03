import { type ConstantValueBindingParameter } from './ConstantValueBindingParameter';
import { type DynamicValueBindingParameter } from './DynamicValueBindingParameter';
import { type InstanceBindingParameter } from './InstanceBindingParameter';

export type BindingParameter =
  | ConstantValueBindingParameter
  | DynamicValueBindingParameter
  | InstanceBindingParameter;
