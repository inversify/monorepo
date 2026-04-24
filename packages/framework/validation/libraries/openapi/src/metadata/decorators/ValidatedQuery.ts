import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPath } from '../../validation/calculations/getPath.js';
import { type QueryValidationInputParam } from '../../validation/models/QueryValidationInputParam.js';
import { validatedInputParamQueryType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedQuery(): ParameterDecorator {
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
      ): Promise<QueryValidationInputParam> => {
        const method: string = options.getMethod(request).toLowerCase();
        const url: string = options.getUrl(request);

        const queries: unknown = options.getQuery(request);

        if (
          typeof queries !== 'object' ||
          queries === null ||
          Array.isArray(queries)
        ) {
          throw new InversifyValidationError(
            InversifyValidationErrorKind.unknown,
            `${method.toUpperCase()} ${url}: Expected query to be a non array object`,
          );
        }

        return {
          method,
          path: getPath(url),
          queries: queries as Record<string, unknown>,
          type: validatedInputParamQueryType,
        };
      },
    )(target, key, index);
  };
}
