import {
  type Binding,
  type BindingScope,
  type BindingType,
  type ScopedBinding,
} from '@inversifyjs/core';

export function isScopedBinding<T>(
  binding: Binding<T>,
): binding is Binding<T> & ScopedBinding<BindingType, BindingScope, T> {
  return (
    (binding as Partial<ScopedBinding<BindingType, BindingScope, T>>).scope !==
    undefined
  );
}
