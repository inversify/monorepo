import { type GetAllOptions, type GetOptions } from '@inversifyjs/core';

export interface InspectCurrentSinglePlanOptions extends GetOptions {
  chained?: never;
  isMultiple?: false;
}

export interface InspectCurrentMultiplePlanOptions extends GetAllOptions {
  isMultiple: true;
}

export type InspectCurrentPlanOptions =
  | InspectCurrentSinglePlanOptions
  | InspectCurrentMultiplePlanOptions;
