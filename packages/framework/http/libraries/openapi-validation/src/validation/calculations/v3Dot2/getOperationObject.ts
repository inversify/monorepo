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

export function getOperationObject(
  openApiObject: OpenApi3Dot2Object,
  method: string,
  path: string,
): OpenApi3Dot2OperationObject {
  const pathItemObject: OpenApi3Dot2PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );

  const operationObject: OpenApi3Dot2OperationObject | undefined = (
    pathItemObject as Record<string, OpenApi3Dot2OperationObject>
  )[method];

  if (operationObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No OpenAPI operation found for method ${method} for path ${path}`,
    );
  }

  return operationObject;
}
