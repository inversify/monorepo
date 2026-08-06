import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getPathItemObject } from './getPathItemObject.js';

export interface ParamParameterEntry {
  parameter: OpenApi3Dot1ParameterObject;
  pointerPrefix: string;
}

function isReferenceObject(
  param: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject,
): param is OpenApi3Dot1ReferenceObject {
  return '$ref' in param;
}

export function getParamParameterObjects(
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  method: string,
  path: string,
): Map<string, ParamParameterEntry> {
  const pathItemObject: OpenApi3Dot1PathItemObject = getPathItemObject(
    openApiObject,
    path,
  );
  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const result: Map<string, ParamParameterEntry> = new Map();

  if (pathItemObject.parameters !== undefined) {
    for (let i: number = 0; i < pathItemObject.parameters.length; i++) {
      const raw: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject =
        pathItemObject.parameters[i] as
          OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject;

      const param: OpenApi3Dot1ParameterObject | null | undefined =
        isReferenceObject(raw)
          ? (openApiResolver.deepResolveReference(raw.$ref) as unknown as
              OpenApi3Dot1ParameterObject | null | undefined)
          : raw;

      if (param == undefined) {
        throw new InversifyOpenApiValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Unable to resolve path parameter at path: ${path} and method: ${method} and index: ${String(i)}`,
        );
      }

      if (param.in === 'path') {
        result.set(param.name, {
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
          OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject;

      const param: OpenApi3Dot1ParameterObject | null | undefined =
        isReferenceObject(raw)
          ? (openApiResolver.deepResolveReference(raw.$ref) as unknown as
              OpenApi3Dot1ParameterObject | null | undefined)
          : raw;

      if (param == undefined) {
        throw new InversifyOpenApiValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Unable to resolve path parameter at path: ${path} and method: ${method} and index: ${String(i)}`,
        );
      }

      if (param.in === 'path') {
        result.set(param.name, {
          parameter: param,
          pointerPrefix: `paths/${escapeJsonPointerFragments(path)}/${method}/parameters/${String(i)}`,
        });
      }
    }
  }

  return result;
}
