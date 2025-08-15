import { Newable } from '@inversifyjs/common';
import { getBaseType } from '@inversifyjs/prototype-utils';

import { InjectFromHierarchyOptions } from '../models/InjectFromHierarchyOptions';
import { injectFrom } from './injectFrom';

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
