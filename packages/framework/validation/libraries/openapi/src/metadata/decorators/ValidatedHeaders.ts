import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getPath } from '../../validation/calculations/getPath.js';
import { type HeaderValidationInputParam } from '../../validation/models/HeaderValidationInputParam.js';
import { validatedInputParamHeaderType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedHeaders(): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    setValidateMetadata(target, key, index);
    createCustomParameterDecorator(
      async (
        request: unknown,
        _response: unknown,
        options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
      ): Promise<HeaderValidationInputParam> => {
        const headers: Record<string, string | string[] | undefined> =
          options.getHeaders(request);

        const method: string = options.getMethod(request).toLowerCase();
        const url: string = options.getUrl(request);

        return {
          headers,
          method,
          path: getPath(url),
          type: validatedInputParamHeaderType,
        };
      },
    )(target, key, index);
  };
}
