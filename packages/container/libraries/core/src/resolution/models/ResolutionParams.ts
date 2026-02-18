import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type PlanResult } from '../../planning/models/PlanResult.js';
import { type ResolutionContext } from './ResolutionContext.js';

export interface ResolutionParams {
  context: ResolutionContext;
  getActivations: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingActivation<TActivated>> | undefined;
  planResult: PlanResult;
  requestScopeCache: Map<number, unknown>;
}
