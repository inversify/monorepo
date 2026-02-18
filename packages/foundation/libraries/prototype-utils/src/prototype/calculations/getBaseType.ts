import { type Newable } from '@inversifyjs/common';

import { type Prototype } from '../models/Prototype.js';

export function getBaseType<TInstance, TArgs extends unknown[]>(
  type: Newable<TInstance, TArgs>,
): Newable | undefined {
  const prototype: Prototype | null = Object.getPrototypeOf(
    type.prototype,
  ) as Prototype | null;

  const baseType: Newable | undefined = prototype?.constructor;

  return baseType;
}
