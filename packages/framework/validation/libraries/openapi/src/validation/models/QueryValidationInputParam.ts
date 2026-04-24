import { type validatedInputParamQueryType } from './validatedInputParamTypes.js';

export interface QueryValidationInputParam {
  queries: Record<string, unknown>;
  method: string;
  path: string;
  type: typeof validatedInputParamQueryType;
}
