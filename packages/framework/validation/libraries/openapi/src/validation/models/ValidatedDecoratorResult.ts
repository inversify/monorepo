import { type BodyValidationInputParam } from './BodyValidationInputParam.js';
import { type HeaderValidationInputParam } from './HeaderValidationInputParam.js';
import { type ParamValidationInputParam } from './ParamValidationInputParam.js';
import { type QueryValidationInputParam } from './QueryValidationInputParam.js';

export type ValidationInputParam =
  | BodyValidationInputParam<unknown>
  | HeaderValidationInputParam
  | ParamValidationInputParam
  | QueryValidationInputParam;
