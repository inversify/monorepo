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

export function getOperationObject(
  openApiObject: OpenApi3Dot1Object,
  method: string,
  path: string,
): OpenApi3Dot1OperationObject {
  const pathItemObject: OpenApi3Dot1PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );

  const operationObject: OpenApi3Dot1OperationObject | undefined = (
    pathItemObject as Record<string, OpenApi3Dot1OperationObject>
  )[method];

  if (operationObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No OpenAPI operation found for method ${method} for path ${path}`,
    );
  }

  return operationObject;
}
