export type BindingType =
  | 'ConstantValue'
  | 'DynamicValue'
  | 'Factory'
  | 'Instance'
  | 'ResolvedValue'
  | 'ServiceRedirection';

export const bindingTypeValues: { [TKey in BindingType]: TKey } = {
  ConstantValue: 'ConstantValue',
  DynamicValue: 'DynamicValue',
  Factory: 'Factory',
  Instance: 'Instance',
  ResolvedValue: 'ResolvedValue',
  ServiceRedirection: 'ServiceRedirection',
};
