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

export interface HeaderParameterEntry {
  parameter: OpenApi3Dot1ParameterObject;
  pointerPrefix: string;
}

function isReferenceObject(
  param: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject,
): param is OpenApi3Dot1ReferenceObject {
  return '$ref' in param;
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
          | OpenApi3Dot1ParameterObject
          | OpenApi3Dot1ReferenceObject;

      const param: OpenApi3Dot1ParameterObject = isReferenceObject(raw)
        ? (openApiResolver.deepResolveReference(
            raw.$ref,
          ) as unknown as OpenApi3Dot1ParameterObject)
        : raw;

      if (param.in === 'header') {
        result.set(param.name.toLowerCase(), {
          parameter: param,
          pointerPrefix: `paths/${escapeJsonPointerFragments(path)}/parameters/${String(i)}`,
        });
      }
    }
  }

  if (operationObject.parameters !== undefined) {
    for (let i: number = 0; i < operationObject.parameters.length; i++) {
      const raw: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject =
        operationObject.parameters[i] as
          | OpenApi3Dot1ParameterObject
          | OpenApi3Dot1ReferenceObject;

      const param: OpenApi3Dot1ParameterObject = isReferenceObject(raw)
        ? (openApiResolver.deepResolveReference(
            raw.$ref,
          ) as unknown as OpenApi3Dot1ParameterObject)
        : raw;

      if (param.in === 'header') {
        result.set(param.name.toLowerCase(), {
          parameter: param,
          pointerPrefix: `paths/${escapeJsonPointerFragments(path)}/${method}/parameters/${String(i)}`,
        });
      }
    }
  }

  return result;
}
