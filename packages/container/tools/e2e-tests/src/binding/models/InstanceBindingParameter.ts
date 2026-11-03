import { type BaseBindingParameter } from './BaseBindingParameter';
import { type BindingParameterKind } from './BindingParameterKind';

export type InstanceBindingParameter =
  BaseBindingParameter<BindingParameterKind.instance>;
