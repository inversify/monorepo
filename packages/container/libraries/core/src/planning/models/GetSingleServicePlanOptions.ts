import { type BaseGetPlanOptions } from './BaseGetPlanOptions.js';

export interface GetSingleServicePlanOptions extends BaseGetPlanOptions {
  isMultiple: false;
}
