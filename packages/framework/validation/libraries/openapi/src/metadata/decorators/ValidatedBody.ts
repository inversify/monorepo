import {
  createCustomParameterMethodDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getMimeType } from '../../validation/calculations/getMimeType.js';
import { getPath } from '../../validation/calculations/getPath.js';
import { type BodyValidationInputParam } from '../../validation/models/BodyValidationInputParam.js';
import { validatedInputParamBodyType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadataByName } from '../actions/setValidateMetadataByName.js';

async function bodyHandler(
  request: unknown,
  response: unknown,
  options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
): Promise<BodyValidationInputParam<unknown>> {
  const contentTypeHeader: string | string[] | undefined =
    options.getHeaders(request, 'content-type');
  const body: unknown = await options.getBody(request, response);
  const method: string = options.getMethod(request).toLowerCase();
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
    path: getPath(url),
    type: validatedInputParamBodyType,
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedBody(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  const methodDec = createCustomParameterMethodDecorator(bodyHandler)(paramName);
  return (value: Function, context: ClassMethodDecoratorContext): void => {
    methodDec(value, context);
    context.addInitializer(function (this: unknown) {
      setValidateMetadataByName(
        [paramName],
        (this as object).constructor as Function,
        context.name,
      );
    });
  };
}
