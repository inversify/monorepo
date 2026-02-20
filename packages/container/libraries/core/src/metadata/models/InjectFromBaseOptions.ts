import { type InjectFromBaseOptionsLifecycle } from './InjectFromBaseOptionsLifecycle.js';

export interface InjectFromBaseOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromBaseOptionsLifecycle | undefined;
}
