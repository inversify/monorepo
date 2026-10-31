import { type GetMultipleServicePlanOptions } from './GetMultipleServicePlanOptions.js';
import { type GetSingleServicePlanOptions } from './GetSingleServicePlanOptions.js';

export type GetPlanOptions =
  | GetSingleServicePlanOptions
  | GetMultipleServicePlanOptions;
