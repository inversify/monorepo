import {
  createCustomParameterMethodDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPath } from '../../validation/calculations/getPath.js';
import { type ParamValidationInputParam } from '../../validation/models/ParamValidationInputParam.js';
import { validatedInputParamParamType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadataByName } from '../actions/setValidateMetadataByName.js';

async function paramsHandler(
  request: unknown,
  _response: unknown,
  options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
): Promise<ParamValidationInputParam> {
  const method: string = options.getMethod(request).toLowerCase();
  const url: string = options.getUrl(request);
  const params: unknown = options.getParams(request);
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
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
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedParams(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  const methodDec = createCustomParameterMethodDecorator(paramsHandler)(paramName);
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
