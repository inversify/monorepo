import { type validatedInputParamParamType } from './validatedInputParamTypes.js';

export interface ParamValidationInputParam {
  params: Record<string, string | string[]>;
  method: string;
  path: string;
  type: typeof validatedInputParamParamType;
}
