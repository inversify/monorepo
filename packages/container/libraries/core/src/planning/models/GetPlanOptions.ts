import { GetMultipleServicePlanOptions } from './GetMultipleServicePlanOptions';
import { GetSingleServicePlanOptions } from './GetSingleServicePlanOptions';

export type GetPlanOptions =
  | GetSingleServicePlanOptions
  | GetMultipleServicePlanOptions;
