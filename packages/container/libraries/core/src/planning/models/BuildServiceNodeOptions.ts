import { type BuildMultipleBindingServiceNodeOptions } from './BuildMultipleBindingServiceNodeOptions.js';
import { type BuildSingleBindingServiceNodeOptions } from './BuildSingleBindingServiceNodeOptions.js';

export type BuildServiceNodeOptions =
  BuildMultipleBindingServiceNodeOptions | BuildSingleBindingServiceNodeOptions;
