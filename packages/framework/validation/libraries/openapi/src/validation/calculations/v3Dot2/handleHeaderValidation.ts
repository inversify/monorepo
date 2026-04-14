import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';
import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type HeaderValidationInputParam } from '../../models/HeaderValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import {
  type CoercionCandidate,
  coerceHeaderValue,
} from '../coerceHeaderValue.js';
import { inferOpenApiSchemaTypes } from '../inferOpenApiSchemaTypes.js';
import {
  type HeaderParameterEntry,
  getHeaderParameterObjects,
} from './getHeaderParameterObjects.js';

function getOrCompileValidator(
  ajv: Ajv,
  validationCacheEntry: ValidationCacheEntry,
  headerName: string,
  schemaPointer: string,
): ValidateFunction {
  let validate: ValidateFunction | undefined =
    validationCacheEntry.headers.get(headerName);

  if (validate === undefined) {
    validate = ajv.getSchema(schemaPointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Unable to find schema for header "${headerName}" at pointer: ${schemaPointer}`,
      );
    }

    validationCacheEntry.headers.set(headerName, validate);
  }

  return validate;
}

export function handleHeaderValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  inputParam: HeaderValidationInputParam,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const headerParams: Map<string, HeaderParameterEntry> =
    getHeaderParameterObjects(
      openApiObject,
      openApiResolver,
      inputParam.method,
      inputParam.path,
    );

  const validationCacheEntry: ValidationCacheEntry = getEntry(
    inputParam.path,
    inputParam.method,
  );

  const result: Record<string, unknown> = {};

  for (const [lowerName, entry] of headerParams) {
    const rawValue: string | string[] | undefined =
      inputParam.headers[lowerName];

    if (rawValue === undefined) {
      if (entry.parameter.required === true) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Required header "${entry.parameter.name}" is missing`,
        );
      }

      continue;
    }

    const resolverSchemaPointer: string = `#/${entry.pointerPrefix}/schema`;
    const ajvSchemaPointer: string = `${SCHEMA_ID}#/${entry.pointerPrefix}/schema`;

    const types: Set<JsonSchemaType> = inferOpenApiSchemaTypes(
      openApiResolver,
      resolverSchemaPointer,
    );

    let candidates: CoercionCandidate[] = coerceHeaderValue(rawValue, types);

    candidates = candidates.map(
      (candidate: CoercionCandidate): CoercionCandidate => {
        if (
          candidate.type === 'array' &&
          Array.isArray(candidate.coercedValue) &&
          entry.parameter.schema !== undefined &&
          'items' in entry.parameter.schema &&
          entry.parameter.schema.items !== undefined
        ) {
          const itemsResolverPointer: string = `#/${entry.pointerPrefix}/schema/items`;

          const itemTypes: Set<JsonSchemaType> = inferOpenApiSchemaTypes(
            openApiResolver,
            itemsResolverPointer,
          );

          const coercedItems: unknown[] = (
            candidate.coercedValue as string[]
          ).map((item: string): unknown => {
            const itemCandidates: CoercionCandidate[] = coerceHeaderValue(
              item,
              itemTypes,
            );

            return itemCandidates.length > 0
              ? (itemCandidates[0] as CoercionCandidate).coercedValue
              : item;
          });

          return { coercedValue: coercedItems, type: 'array' };
        }

        return candidate;
      },
    );

    const validate: ValidateFunction = getOrCompileValidator(
      ajv,
      validationCacheEntry,
      lowerName,
      ajvSchemaPointer,
    );

    let validated: boolean = false;

    for (const candidate of candidates) {
      if (validate(candidate.coercedValue)) {
        result[lowerName] = candidate.coercedValue;
        validated = true;
        break;
      }
    }

    if (!validated) {
      const lastValue: unknown =
        candidates.length > 0
          ? (candidates[candidates.length - 1] as CoercionCandidate)
              .coercedValue
          : rawValue;

      validate(lastValue);

      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Header "${entry.parameter.name}" validation failed: ${(validate.errors ?? [])
          .map(
            (error: ErrorObject): string =>
              `[schema: ${error.schemaPath}, instance: ${error.instancePath}]: "${error.message ?? '-'}"`,
          )
          .join('\n')}`,
      );
    }
  }

  return result;
}
