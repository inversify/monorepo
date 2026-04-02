import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';

export function buildOrGetOpenApiOperationObject(
  controllerMetadata: ControllerOpenApiMetadata,
  methodName: string | symbol,
): OpenApi3Dot1OperationObject {
  let operationObject: OpenApi3Dot1OperationObject | undefined =
    controllerMetadata.methodToOperationObjectMap.get(methodName);

  if (operationObject === undefined) {
    operationObject = {};

    controllerMetadata.methodToOperationObjectMap.set(
      methodName,
      operationObject,
    );
  }

  return operationObject;
}
