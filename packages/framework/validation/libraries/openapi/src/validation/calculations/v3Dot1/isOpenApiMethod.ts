import {
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { type AllOfKind } from '../../../comon/models/AllOfKind.js';
import { type FilteredByValueType } from '../../../comon/models/FilteredByValueType.js';

type OpenApiMethod = keyof FilteredByValueType<
  OpenApi3Dot1PathItemObject,
  OpenApi3Dot1OperationObject
>;

// eslint-disable-next-line @typescript-eslint/typedef
const allOpenApiMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'put',
  'post',
  'trace',
] as const satisfies readonly (keyof OpenApi3Dot1PathItemObject)[];

const allOpenApiMethodsSet: Set<OpenApiMethod> = new Set(
  allOpenApiMethods satisfies AllOfKind<
    typeof allOpenApiMethods,
    OpenApiMethod
  >,
);

export function isOpenApiMethod(method: string): method is OpenApiMethod {
  return allOpenApiMethodsSet.has(method as OpenApiMethod);
}
