import { ServiceIdentifier } from '@inversifyjs/common';

import { AutobindOptions } from '../../binding/models/AutobindOptions';
import { PlanParamsOperations } from './PlanParamsOperations';

export interface BasePlanParams {
  autobindOptions: AutobindOptions | undefined;
  operations: PlanParamsOperations;
  servicesBranch: ServiceIdentifier[];
}
