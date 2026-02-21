import { type BindingConstraints } from '@inversifyjs/core';

export class BindingConstraintUtils {
  public static readonly always: (
    bindingConstraints: BindingConstraints,
  ) => boolean = (_bindingConstraints: BindingConstraints): boolean => {
    return true;
  };
}
