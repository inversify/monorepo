import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPathItemObject } from './getPathItemObject.js';
import { isOpenApiMethod } from './isOpenApiMethod.js';

export function getOperationObject(
  openApiObject: OpenApi3Dot2Object,
  method: string,
  path: string,
): OpenApi3Dot2OperationObject {
  const pathItemObject: OpenApi3Dot2PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );

  if (!isOpenApiMethod(method)) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Method ${method} is not a valid OpenAPI method`,
    );
  }

  const operationObject: OpenApi3Dot2OperationObject | undefined =
    pathItemObject[method];

  if (operationObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No OpenAPI operation found for method ${method} for path ${path}`,
    );
  }

  return operationObject;
}
