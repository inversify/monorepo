import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type StringRecordValue } from '../../../common/models/StringRecordValue.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';
import { type OpenApi3Dot2OperationRecordKeys } from '../../models/v3Dot2/OpenApiOperationKeys.js';
import { updateControllerOpenApiMetadataOperationRecordProperty as curryUpdateControllerOpenApiMetadataOperationRecordProperty } from '../updateControllerOpenApiMetadataOperationRecordProperty.js';
import { buildOrGetOpenApiOperationObject } from './buildOrGetOpenApiOperationObject.js';

export const updateControllerOpenApiMetadataOperationRecordProperty: (
  key: string,
  value: StringRecordValue<
    OpenApi3Dot2OperationObject[OpenApi3Dot2OperationRecordKeys]
  >,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  methodKey: string | symbol,
  propertyKey: OpenApi3Dot2OperationRecordKeys,
) => (metadata: ControllerOpenApiMetadata) => ControllerOpenApiMetadata =
  curryUpdateControllerOpenApiMetadataOperationRecordProperty(
    buildOrGetOpenApiOperationObject,
  );
