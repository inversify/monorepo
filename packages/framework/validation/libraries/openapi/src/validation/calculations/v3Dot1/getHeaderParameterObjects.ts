import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getPathItemObject } from './getPathItemObject.js';
import {
  type ResolvedParameterObject,
  resolveParameterObject,
} from './resolveParameterObject.js';

export interface HeaderParameterEntry {
  parameter: OpenApi3Dot1ParameterObject;
  pointerPrefix: string;
}

export function getHeaderParameterObjects(
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  method: string,
  path: string,
): Map<string, HeaderParameterEntry> {
  const pathItemObject: OpenApi3Dot1PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );
  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const result: Map<string, HeaderParameterEntry> = new Map();

  if (pathItemObject.parameters !== undefined) {
    for (let i: number = 0; i < pathItemObject.parameters.length; i++) {
      const raw: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject =
        pathItemObject.parameters[i] as
          OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject;

      const resolved: ResolvedParameterObject = resolveParameterObject(
        openApiResolver,
        raw,
        method,
        path,
        i,
      );

      const param: OpenApi3Dot1ParameterObject = resolved.parameter;

      if (param.in === 'header') {
        result.set(param.name.toLowerCase(), {
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
      const raw: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject =
        operationObject.parameters[i] as
          OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject;

      const resolved: ResolvedParameterObject = resolveParameterObject(
        openApiResolver,
        raw,
        method,
        path,
        i,
      );

      const param: OpenApi3Dot1ParameterObject = resolved.parameter;

      if (param.in === 'header') {
        result.set(param.name.toLowerCase(), {
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
