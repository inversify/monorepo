import { InjectFromBaseOptionsLifecycle } from './InjectFromBaseOptionsLifecycle';

export interface InjectFromBaseOptions {
  extendConstructorArguments?: boolean | undefined;
  extendProperties?: boolean | undefined;
  lifecycle?: InjectFromBaseOptionsLifecycle | undefined;
}
