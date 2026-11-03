import { type BaseBindingParameter } from './BaseBindingParameter';
import { type BindingParameterKind } from './BindingParameterKind';

export type DynamicValueBindingParameter =
  BaseBindingParameter<BindingParameterKind.dynamicValue>;
