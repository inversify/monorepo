import { type BaseGetPlanOptions } from './BaseGetPlanOptions.js';

export interface GetMultipleServicePlanOptions extends BaseGetPlanOptions {
  chained: boolean;
  isMultiple: true;
}
