import { type validatedInputParamBodyType } from './validatedInputParamTypes.js';

export interface BodyValidationInputParam<TBody> {
  body: TBody;
  contentType: string | undefined;
  method: string;
  type: typeof validatedInputParamBodyType;
  url: string;
}
