import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type ArrayValue } from '../../../common/models/ArrayValue.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot2OperationArrayKeys } from '../../models/v3Dot2/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationArrayProperty as curryUpdateControllerOpenApiMetadataOperationArrayProperty } from '../updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationArrayProperty: (
  value: ArrayValue<
    OpenApi3Dot2OperationObject[OpenApi3Dot2OperationArrayKeys]
  >,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot2OperationArrayKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationArrayProperty<
    OpenApi3Dot2OperationArrayKeys,
    ControllerOpenApiMetadata,
    OpenApi3Dot2OperationObject
  >(buildOrGetOpenApiOperationObject);
