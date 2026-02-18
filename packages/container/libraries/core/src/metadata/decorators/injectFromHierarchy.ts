import { type Newable } from '@inversifyjs/common';
import { getBaseType } from '@inversifyjs/prototype-utils';

import { type InjectFromHierarchyOptions } from '../models/InjectFromHierarchyOptions.js';
import { injectFrom } from './injectFrom.js';

export function injectFromHierarchy(
  options?: InjectFromHierarchyOptions,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function): void => {
    const chain: Newable[] = [];

    let current: Newable | undefined = getBaseType(target as Newable);
    while (current !== undefined && current !== Object) {
      const ancestor: Newable = current;
      chain.push(ancestor);
      current = getBaseType(ancestor);
    }

    chain.reverse();

    for (const type of chain) {
      injectFrom({ ...options, type })(target);
    }
  };
}
