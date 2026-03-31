import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ArrayValue } from '../../../common/models/ArrayValue.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot1OperationArrayKeys } from '../../models/v3Dot1/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationArrayProperty as curryUpdateControllerOpenApiMetadataOperationArrayProperty } from '../updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationArrayProperty: (
  value: ArrayValue<
    OpenApi3Dot1OperationObject[OpenApi3Dot1OperationArrayKeys]
  >,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot1OperationArrayKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationArrayProperty<
    OpenApi3Dot1OperationArrayKeys,
    ControllerOpenApiMetadata,
    OpenApi3Dot1OperationObject
  >(buildOrGetOpenApiOperationObject);
