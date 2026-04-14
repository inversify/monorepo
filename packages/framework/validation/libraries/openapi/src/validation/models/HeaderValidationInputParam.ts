import { type validatedInputParamHeaderType } from './validatedInputParamTypes.js';

export interface HeaderValidationInputParam {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  path: string;
  type: typeof validatedInputParamHeaderType;
}
