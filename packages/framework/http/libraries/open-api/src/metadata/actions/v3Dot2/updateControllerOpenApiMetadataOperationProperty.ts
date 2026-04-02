import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot2OperationNonArrayNonRecordKeys } from '../../models/v3Dot2/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationProperty as curryUpdateControllerOpenApiMetadataOperationProperty } from '../updateControllerOpenApiMetadataOperationProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationProperty: (
  value: OpenApi3Dot2OperationObject[OpenApi3Dot2OperationNonArrayNonRecordKeys],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot2OperationNonArrayNonRecordKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationProperty(
    buildOrGetOpenApiOperationObject,
  );
