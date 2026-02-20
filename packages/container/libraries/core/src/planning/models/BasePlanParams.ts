import { type ServiceIdentifier } from '@inversifyjs/common';

import { type AutobindOptions } from '../../binding/models/AutobindOptions.js';
import { type PlanParamsOperations } from './PlanParamsOperations.js';

export interface BasePlanParams {
  autobindOptions: AutobindOptions | undefined;
  operations: PlanParamsOperations;
  servicesBranch: ServiceIdentifier[];
}
