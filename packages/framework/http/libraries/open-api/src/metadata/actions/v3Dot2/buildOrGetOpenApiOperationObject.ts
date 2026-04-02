import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';

export function buildOrGetOpenApiOperationObject(
  controllerMetadata: ControllerOpenApiMetadata,
  methodName: string | symbol,
): OpenApi3Dot2OperationObject {
  let operationObject: OpenApi3Dot2OperationObject | undefined =
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
