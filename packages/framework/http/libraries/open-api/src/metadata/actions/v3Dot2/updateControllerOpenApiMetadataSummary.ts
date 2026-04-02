import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

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
      const operationObject: OpenApi3Dot2OperationObject =
        buildOrGetOpenApiOperationObject(metadata, key);

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
