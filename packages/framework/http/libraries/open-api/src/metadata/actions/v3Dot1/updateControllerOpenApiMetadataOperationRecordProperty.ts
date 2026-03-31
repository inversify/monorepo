import { type OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type StringRecordValue } from '../../../common/models/StringRecordValue.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot1OperationRecordKeys } from '../../models/v3Dot1/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationRecordProperty as curryUpdateControllerOpenApiMetadataOperationRecordProperty } from '../updateControllerOpenApiMetadataOperationRecordProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationRecordProperty: (
  key: string,
  value: StringRecordValue<
    OpenApi3Dot1OperationObject[OpenApi3Dot1OperationRecordKeys]
  >,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot1OperationRecordKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationRecordProperty(
    buildOrGetOpenApiOperationObject,
  );
