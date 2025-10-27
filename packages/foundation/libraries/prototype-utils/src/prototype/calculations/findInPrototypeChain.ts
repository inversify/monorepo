import { type Newable } from '@inversifyjs/common';

import { getBaseType } from './getBaseType';

export function findInPrototypeChain<T>(
  type: Newable,
  reader: (type: Newable) => T | undefined,
): T | undefined {
  for (
    let currentType: Newable | undefined = type;
    currentType !== undefined;
    currentType = getBaseType(currentType)
  ) {
    const value: T | undefined = reader(currentType);

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}
