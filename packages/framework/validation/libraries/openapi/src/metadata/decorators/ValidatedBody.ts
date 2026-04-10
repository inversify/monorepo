import {
  createCustomParameterDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getMimeType } from '../../validation/calculations/getMimeType.js';
import { type BodyValidationInputParam } from '../../validation/models/BodyValidationInputParam.js';
import { validatedInputParamBodyType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadata } from '../actions/setValidateMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedBody(): ParameterDecorator {
  return (
    target: object,
    key: string | symbol | undefined,
    index: number,
  ): void => {
    setValidateMetadata(target, key, index);
    createCustomParameterDecorator(
      async (
        request: unknown,
        response: unknown,
        options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
      ): Promise<BodyValidationInputParam<unknown>> => {
        const contentTypeHeader: string | string[] | undefined =
          options.getHeaders(request, 'content-type') as
            | string
            | string[]
            | undefined;

        const body: unknown = await options.getBody(request, response);

        const method: string = options.getMethod(request);
        const url: string = options.getUrl(request);

        const contentType: string | undefined =
          contentTypeHeader === undefined
            ? undefined
            : Array.isArray(contentTypeHeader)
              ? contentTypeHeader[0] === undefined
                ? undefined
                : getMimeType(contentTypeHeader[0])
              : getMimeType(contentTypeHeader);

        return {
          body,
          contentType,
          method,
          type: validatedInputParamBodyType,
          url,
        };
      },
    )(target, key, index);
  };
}
