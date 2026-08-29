import {
  createCustomParameterMethodDecorator,
  type CustomParameterDecoratorHandlerOptions,
} from '@inversifyjs/http-core';

import { getPath } from '../../validation/calculations/getPath.js';
import { type HeaderValidationInputParam } from '../../validation/models/HeaderValidationInputParam.js';
import { validatedInputParamHeaderType } from '../../validation/models/validatedInputParamTypes.js';
import { setValidateMetadataByName } from '../actions/setValidateMetadataByName.js';

async function headersHandler(
  request: unknown,
  _response: unknown,
  options: CustomParameterDecoratorHandlerOptions<unknown, unknown>,
): Promise<HeaderValidationInputParam> {
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
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidatedHeaders(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  const methodDec = createCustomParameterMethodDecorator(headersHandler)(paramName);
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
