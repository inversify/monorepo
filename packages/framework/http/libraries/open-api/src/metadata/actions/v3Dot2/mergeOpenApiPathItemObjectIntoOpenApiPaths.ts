import { type JsonValueObject } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { deepMerge } from '../../../common/actions/deepMerge.js';

export function mergeOpenApiPathItemObjectIntoOpenApiPaths(
  target: OpenApi3Dot2Object,
  path: string,
  openApiPathItemObject: OpenApi3Dot2PathItemObject,
): OpenApi3Dot2Object {
  if (target.paths === undefined) {
    target.paths = {};
  }

  if (target.paths[path] === undefined) {
    target.paths[path] = structuredClone(openApiPathItemObject);
  } else {
    target.paths[path] = deepMerge(
      target.paths[path] as JsonValueObject,
      openApiPathItemObject as JsonValueObject,
    ) as OpenApi3Dot2PathItemObject;
  }

  return target;
}
