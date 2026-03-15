import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ArrayValue } from '../../common/models/ArrayValue.js';
import { type ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot1OperationArrayKeys } from '../models/OpenApi3Dot1OperationKeys.js';
import { buildOrGetOperationObject } from './buildOrGetOperationObject.js';

export function updateControllerOpenApiMetadataOperationArrayProperty<
  TKey extends OpenApi3Dot1OperationArrayKeys,
>(
  value: ArrayValue<OpenApi3Dot1OperationObject[TKey]>,
  methodKey: string | symbol,
  propertyKey: TKey,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    const operationObject: OpenApi3Dot1OperationObject =
      buildOrGetOperationObject(metadata, methodKey);

    if (operationObject[propertyKey] === undefined) {
      operationObject[propertyKey] = [];
    }

    (
      operationObject[propertyKey] as ArrayValue<
        OpenApi3Dot1OperationObject[TKey]
      >[]
    ).push(value);

    return metadata;
  };
}
