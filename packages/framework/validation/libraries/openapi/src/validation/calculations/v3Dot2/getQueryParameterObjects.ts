import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2PathItemObject,
  type OpenApi3Dot2ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getPathItemObject } from './getPathItemObject.js';
import {
  type ResolvedParameterObject,
  resolveParameterObject,
} from './resolveParameterObject.js';

export interface QueryParameterEntry {
  parameter: OpenApi3Dot2ParameterObject;
  pointerPrefix: string;
}

export function getQueryParameterObjects(
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  method: string,
  path: string,
): Map<string, QueryParameterEntry> {
  const pathItemObject: OpenApi3Dot2PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );
  const operationObject: OpenApi3Dot2OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const result: Map<string, QueryParameterEntry> = new Map();

  if (pathItemObject.parameters !== undefined) {
    for (let i: number = 0; i < pathItemObject.parameters.length; i++) {
      const raw: OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject =
        pathItemObject.parameters[i] as
          OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject;

      const resolved: ResolvedParameterObject = resolveParameterObject(
        openApiResolver,
        raw,
        method,
        path,
        i,
      );

      const param: OpenApi3Dot2ParameterObject = resolved.parameter;

      if (param.in === 'query') {
        result.set(param.name, {
          parameter: param,
          pointerPrefix:
            resolved.pointerPrefix ??
            `paths/${escapeJsonPointerFragments(path)}/parameters/${String(i)}`,
        });
      }
    }
  }

  if (operationObject.parameters !== undefined) {
    for (let i: number = 0; i < operationObject.parameters.length; i++) {
      const raw: OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject =
        operationObject.parameters[i] as
          OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject;

      const resolved: ResolvedParameterObject = resolveParameterObject(
        openApiResolver,
        raw,
        method,
        path,
        i,
      );

      const param: OpenApi3Dot2ParameterObject = resolved.parameter;

      if (param.in === 'query') {
        result.set(param.name, {
          parameter: param,
          pointerPrefix:
            resolved.pointerPrefix ??
            `paths/${escapeJsonPointerFragments(path)}/${method}/parameters/${String(i)}`,
        });
      }
    }
  }

  return result;
}
