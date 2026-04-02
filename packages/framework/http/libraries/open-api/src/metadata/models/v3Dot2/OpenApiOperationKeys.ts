import { type OpenApi3Dot2OperationObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type FilteredByValueType } from '../../../common/models/FilteredByValueType.js';

type OpenApi3Dot2OperationKeys = keyof OpenApi3Dot2OperationObject;

export type OpenApi3Dot2OperationArrayKeys = keyof FilteredByValueType<
  OpenApi3Dot2OperationObject,
  Array<unknown>
>;

export type OpenApi3Dot2OperationRecordKeys = keyof FilteredByValueType<
  OpenApi3Dot2OperationObject,
  Record<string, unknown>
>;

export type OpenApi3Dot2OperationNonArrayNonRecordKeys = Exclude<
  OpenApi3Dot2OperationKeys,
  OpenApi3Dot2OperationArrayKeys | OpenApi3Dot2OperationRecordKeys
>;
