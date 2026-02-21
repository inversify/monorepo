import {
  type Binding,
  type bindingScopeValues,
  type BindingType,
  type ScopedBinding,
} from '@inversifyjs/core';

export type SingletonScopedBinding = Binding &
  ScopedBinding<BindingType, typeof bindingScopeValues.Singleton, unknown>;
