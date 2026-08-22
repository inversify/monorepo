import { type TraverseJsonSchemaCallbackParams } from './TraverseJsonSchemaCallbackParams.js';
import { type TraverseJsonSchemaCallbackParamsResult } from './TraverseJsonSchemaCallbackParamsResult.js';

export type TraverseJsonSchemaCallback =
  | ((params: TraverseJsonSchemaCallbackParams) => void)
  | ((
      params: TraverseJsonSchemaCallbackParams,
    ) => TraverseJsonSchemaCallbackParamsResult);
