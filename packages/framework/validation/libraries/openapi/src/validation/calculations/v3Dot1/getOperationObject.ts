import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPathItemObject } from './getPathItemObject.js';
import { isOpenApiMethod } from './isOpenApiMethod.js';

export function getOperationObject(
  openApiObject: OpenApi3Dot1Object,
  method: string,
  path: string,
): OpenApi3Dot1OperationObject {
  const pathItemObject: OpenApi3Dot1PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );

  if (!isOpenApiMethod(method)) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Method ${method} is not a valid OpenAPI method`,
    );
  }

  const operationObject: OpenApi3Dot1OperationObject | undefined =
    pathItemObject[method];

  if (operationObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No OpenAPI operation found for method ${method} for path ${path}`,
    );
  }

  return operationObject;
}
