import { type Newable } from '@inversifyjs/common';

import { type InjectFromOptionsLifecycle } from './InjectFromOptionsLifecycle.js';

export interface InjectFromOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromOptionsLifecycle | undefined;
  type: Newable;
}
