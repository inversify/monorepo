import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot1OperationNonArrayNonRecordKeys } from '../../models/v3Dot1/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationProperty as curryUpdateControllerOpenApiMetadataOperationProperty } from '../updateControllerOpenApiMetadataOperationProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationProperty: (
  value: OpenApi3Dot1OperationObject[OpenApi3Dot1OperationNonArrayNonRecordKeys],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot1OperationNonArrayNonRecordKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationProperty(
    buildOrGetOpenApiOperationObject,
  );
