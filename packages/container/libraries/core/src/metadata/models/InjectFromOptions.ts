import { Newable } from '@inversifyjs/common';

import { InjectFromOptionsLifecycle } from './InjectFromOptionsLifecycle';

export interface InjectFromOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromOptionsLifecycle | undefined;
  type: Newable;
}
