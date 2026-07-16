import { type PlanResult } from '../../planning/models/PlanResult.js';
import { type ResolutionContext } from './ResolutionContext.js';

export interface ResolutionParams {
  context: ResolutionContext;
  planResult: PlanResult;
  requestScopeCache: Map<number, unknown> | undefined;
}
