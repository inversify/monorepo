import { type BaseBuildServiceNodeOptions } from './BaseBuildServiceNodeOptions.js';

export interface BuildMultipleBindingServiceNodeOptions extends BaseBuildServiceNodeOptions<true> {
  chained: boolean;
}
