import { OpenApi3Dot1OperationObject } from '@inversifyjs/open-api-types/v3Dot1';

import { FilteredByValueType } from '../../common/models/FilteredByValueType';

type OpenApi3Dot1OperationKeys = keyof OpenApi3Dot1OperationObject;

export type OpenApi3Dot1OperationArrayKeys = keyof FilteredByValueType<
  OpenApi3Dot1OperationObject,
  Array<unknown>
>;

export type OpenApi3Dot1OperationRecordKeys = keyof FilteredByValueType<
  OpenApi3Dot1OperationObject,
  Record<string, unknown>
>;

export type OpenApi3Dot1OperationNonArrayNonRecordKeys = Exclude<
  OpenApi3Dot1OperationKeys,
  OpenApi3Dot1OperationArrayKeys | OpenApi3Dot1OperationRecordKeys
>;
