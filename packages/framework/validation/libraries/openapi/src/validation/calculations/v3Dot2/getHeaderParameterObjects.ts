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

export interface HeaderParameterEntry {
  parameter: OpenApi3Dot2ParameterObject;
  pointerPrefix: string;
}

function isReferenceObject(
  param: OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject,
): param is OpenApi3Dot2ReferenceObject {
  return '$ref' in param;
}

export function getHeaderParameterObjects(
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  method: string,
  path: string,
): Map<string, HeaderParameterEntry> {
  const pathItemObject: OpenApi3Dot2PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );
  const operationObject: OpenApi3Dot2OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const result: Map<string, HeaderParameterEntry> = new Map();

  if (pathItemObject.parameters !== undefined) {
    for (let i: number = 0; i < pathItemObject.parameters.length; i++) {
      const raw: OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject =
        pathItemObject.parameters[i] as
          | OpenApi3Dot2ParameterObject
          | OpenApi3Dot2ReferenceObject;

      const param: OpenApi3Dot2ParameterObject = isReferenceObject(raw)
        ? (openApiResolver.deepResolveReference(
            raw.$ref,
          ) as OpenApi3Dot2ParameterObject)
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
      const raw: OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject =
        operationObject.parameters[i] as
          | OpenApi3Dot2ParameterObject
          | OpenApi3Dot2ReferenceObject;

      const param: OpenApi3Dot2ParameterObject = isReferenceObject(raw)
        ? (openApiResolver.deepResolveReference(
            raw.$ref,
          ) as OpenApi3Dot2ParameterObject)
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
