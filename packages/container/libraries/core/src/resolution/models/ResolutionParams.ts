import { ServiceIdentifier } from '@inversifyjs/common';

import { BindingActivation } from '../../binding/models/BindingActivation';
import { PlanResult } from '../../planning/models/PlanResult';
import { ResolutionContext } from './ResolutionContext';

export interface ResolutionParams {
  context: ResolutionContext;
  getActivations: <TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ) => Iterable<BindingActivation<TActivated>> | undefined;
  planResult: PlanResult;
  requestScopeCache: Map<number, unknown>;
}
