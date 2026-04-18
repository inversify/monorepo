import { type BodyValidationInputParam } from './BodyValidationInputParam.js';
import { type HeaderValidationInputParam } from './HeaderValidationInputParam.js';

export type ValidationInputParam =
  | BodyValidationInputParam<unknown>
  | HeaderValidationInputParam;
