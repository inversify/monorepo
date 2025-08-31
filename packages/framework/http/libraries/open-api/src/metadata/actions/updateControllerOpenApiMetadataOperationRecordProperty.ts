import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { StringRecordValue } from '../../common/models/StringRecordValue';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { OpenApi3Dot1OperationRecordKeys } from '../models/OpenApi3Dot1OperationKeys';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';

export function updateControllerOpenApiMetadataOperationRecordProperty<
  TKey extends OpenApi3Dot1OperationRecordKeys,
>(
  key: string,
  value: StringRecordValue<OpenApi3Dot1OperationObject[TKey]>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: TKey,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    const operationObject: OpenApi3Dot1OperationObject =
      buildOrGetOperationObject(metadata, methodKey);

    if (operationObject[propertyKey] === undefined) {
      operationObject[propertyKey] = {};
    }

    if (
      (
        operationObject[propertyKey] as Record<
          string,
          StringRecordValue<OpenApi3Dot1OperationObject[TKey]>
        >
      )[key] !== undefined
    ) {
      throw new Error(
        `Cannot define ${target.name}.${methodKey.toString()} ${propertyKey} (${key}) more than once`,
      );
    }

    (
      operationObject[propertyKey] as Record<
        string,
        StringRecordValue<OpenApi3Dot1OperationObject[TKey]>
      >
    )[key] = value;

    return metadata;
  };
}
