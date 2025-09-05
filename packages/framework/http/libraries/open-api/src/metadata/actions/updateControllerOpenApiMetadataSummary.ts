import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';

export function updateControllerOpenApiMetadataSummary(
  summary: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  key?: string | symbol,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    if (key === undefined) {
      if (metadata.summary !== undefined) {
        throw new Error(`Cannot define ${target.name} summary more than once`);
      }

      metadata.summary = summary;
    } else {
      const operationObject: OpenApi3Dot1OperationObject =
        buildOrGetOperationObject(metadata, key);

      if (operationObject.summary !== undefined) {
        throw new Error(
          `Cannot define ${target.name}.${key.toString()} summary more than once`,
        );
      }

      operationObject.summary = summary;
    }

    return metadata;
  };
}
