import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type BindingType } from '../../binding/models/BindingType.js';
import { type BaseBindingInspection } from './BaseBindingInspection.js';

export interface ScopedBindingInspection<
  TType extends BindingType,
  TScope extends BindingScope = BindingScope,
> extends BaseBindingInspection<TType> {
  readonly scope: TScope;
}
