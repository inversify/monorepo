import {
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1ServerObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';
import { buildOrGetOperationObject } from './buildOrGetOperationObject';

export function updateControllerOpenApiMetadataServer(
  server: OpenApi3Dot1ServerObject,
  key?: string | symbol,
): (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata {
  return (metadata: ControllerOpenApiMetadata): ControllerOpenApiMetadata => {
    if (key === undefined) {
      if (metadata.servers === undefined) {
        metadata.servers = [];
      }

      metadata.servers.push(server);
    } else {
      const operationObject: OpenApi3Dot1OperationObject =
        buildOrGetOperationObject(metadata, key);

      if (operationObject.servers === undefined) {
        operationObject.servers = [];
      }

      operationObject.servers.push(server);
    }

    return metadata;
  };
}
