import { Binding, CacheBindingInvalidationKind } from '@inversifyjs/core';

export interface CacheBindingInvalidation {
  binding: Binding<unknown>;
  kind: CacheBindingInvalidationKind;
}
