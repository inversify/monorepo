import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { OpenApi3Dot1OperationNonArrayNonRecordKeys } from '../models/OpenApi3Dot1OperationKeys';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';

export function updateControllerOpenApiMetadataOperationProperty<
  TKey extends OpenApi3Dot1OperationNonArrayNonRecordKeys,
>(
  value: OpenApi3Dot1OperationObject[TKey],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: TKey,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    const operationObject: OpenApi3Dot1OperationObject =
      buildOrGetOperationObject(metadata, methodKey);

    if (operationObject[propertyKey] !== undefined) {
      throw new Error(
        `Cannot define ${target.name}.${methodKey.toString()} ${propertyKey} more than once`,
      );
    }

    operationObject[propertyKey] = value;

    return metadata;
  };
}
