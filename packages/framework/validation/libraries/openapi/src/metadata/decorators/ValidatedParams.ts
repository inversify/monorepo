import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPath } from '../../validation/calculations/getPath.js';
import { type ParamValidationInputParam } from '../../validation/models/ParamValidationInputParam.js';
import { validatedInputParamParamType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedParams(): ParameterDecorator {
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
      ): Promise<ParamValidationInputParam> => {
        const method: string = options.getMethod(request).toLowerCase();
        const url: string = options.getUrl(request);

        const params: unknown = options.getParams(request);

        if (
          typeof params !== 'object' ||
          params === null ||
          Array.isArray(params)
        ) {
          throw new InversifyValidationError(
            InversifyValidationErrorKind.unknown,
            `${method.toUpperCase()} ${url}: Expected params to be a non array object`,
          );
        }

        return {
          method,
          params: params as Record<string, string | string[]>,
          path: getPath(url),
          type: validatedInputParamParamType,
        };
      },
    )(target, key, index);
  };
}
