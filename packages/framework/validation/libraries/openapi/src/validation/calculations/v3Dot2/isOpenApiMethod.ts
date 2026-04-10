import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type AllOfKind } from '../../../comon/models/AllOfKind.js';
import { type FilteredByValueType } from '../../../comon/models/FilteredByValueType.js';

type OpenApiMethod = keyof FilteredByValueType<
  OpenApi3Dot2PathItemObject,
  OpenApi3Dot2OperationObject
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
  'query',
  'trace',
] as const satisfies readonly (keyof OpenApi3Dot2PathItemObject)[];

const allOpenApiMethodsSet: Set<OpenApiMethod> = new Set(
  allOpenApiMethods satisfies AllOfKind<
    typeof allOpenApiMethods,
    OpenApiMethod
  >,
);

export function isOpenApiMethod(method: string): method is OpenApiMethod {
  return allOpenApiMethodsSet.has(method as OpenApiMethod);
}
