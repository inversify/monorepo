import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata.js';

export function buildOrGetOperationObject(
  controllerMetadata: ControllerOpenApiMetadata,
  methodName: string | symbol,
): OpenApi3Dot1OperationObject {
  let operationObject: OpenApi3Dot1OperationObject | undefined =
    controllerMetadata.methodToPathItemObjectMap.get(methodName);

  if (operationObject === undefined) {
    operationObject = {};

    controllerMetadata.methodToPathItemObjectMap.set(
      methodName,
      operationObject,
    );
  }

  return operationObject;
}
