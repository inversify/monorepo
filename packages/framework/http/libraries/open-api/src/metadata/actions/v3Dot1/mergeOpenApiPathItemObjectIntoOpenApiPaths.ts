import { type JsonValueObject } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { deepMerge } from '../../../common/actions/deepMerge.js';

export function mergeOpenApiPathItemObjectIntoOpenApiPaths(
  target: OpenApi3Dot1Object,
  path: string,
  openApiPathItemObject: OpenApi3Dot1PathItemObject,
): OpenApi3Dot1Object {
  if (target.paths === undefined) {
    target.paths = {};
  }

  if (target.paths[path] === undefined) {
    target.paths[path] = openApiPathItemObject;
  } else {
    target.paths[path] = deepMerge(
      target.paths[path] as JsonValueObject,
      openApiPathItemObject as JsonValueObject,
    ) as OpenApi3Dot1PathItemObject;
  }

  return target;
}
