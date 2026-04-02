import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ServerObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export function updateControllerOpenApiMetadataServer(
  server: OpenApi3Dot2ServerObject,
  key?: string | symbol,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    if (key === undefined) {
      if (metadata.servers === undefined) {
        metadata.servers = [];
      }

      metadata.servers.push(server);
    } else {
      const operationObject: OpenApi3Dot2OperationObject =
        buildOrGetOpenApiOperationObject(metadata, key);

      if (operationObject.servers === undefined) {
        operationObject.servers = [];
      }

      operationObject.servers.push(server);
    }

    return metadata;
  };
}
