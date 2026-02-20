import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type PlanParams } from '../models/PlanParams.js';

export function buildGetPlanOptionsFromPlanParams(
  params: PlanParams,
): GetPlanOptions {
  if (params.rootConstraints.isMultiple) {
    return {
      chained: params.rootConstraints.chained,
      isMultiple: true,
      name: params.rootConstraints.name,
      optional: params.rootConstraints.isOptional ?? false,
      serviceIdentifier: params.rootConstraints.serviceIdentifier,
      tag: params.rootConstraints.tag,
    };
  } else {
    return {
      isMultiple: false,
      name: params.rootConstraints.name,
      optional: params.rootConstraints.isOptional ?? false,
      serviceIdentifier: params.rootConstraints.serviceIdentifier,
      tag: params.rootConstraints.tag,
    };
  }
}
