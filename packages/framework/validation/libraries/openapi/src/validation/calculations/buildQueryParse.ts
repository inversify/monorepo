import {
  type JsonSchema,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { inferSchemaTypeOrPrimitivaSchemaTypeOrThrow } from './inferSchemaTypeOrPrimitivaSchemaTypeOrThrow.js';
import { maybeCoerceStringToNonNullableBoolean } from './maybeCoerceStringToNonNullableBoolean.js';
import { maybeCoerceStringToNonNullableNumber } from './maybeCoerceStringToNonNullableNumber.js';
import { maybeCoerceStringToNull } from './maybeCoerceStringToNull.js';
import { maybeCoerceStringToNullableBoolean } from './maybeCoerceStringToNullableBoolean.js';
import { maybeCoerceStringToNullableNumber } from './maybeCoerceStringToNullableNumber.js';

function passThroughIfNotString(
  coerce: (value: string | undefined) => unknown,
): (value: unknown) => unknown {
  return (value: unknown): unknown => {
    if (value === undefined || typeof value === 'string') {
      return coerce(value);
    }

    return value;
  };
}

export function buildQueryParseFromType(
  isNullable: boolean,
  type: JsonSchemaType,
): (value: unknown) => unknown {
  switch (type) {
    case 'boolean':
      if (isNullable) {
        return passThroughIfNotString(maybeCoerceStringToNullableBoolean);
      } else {
        return passThroughIfNotString(maybeCoerceStringToNonNullableBoolean);
      }
    case 'integer':
    case 'number':
      if (isNullable) {
        return passThroughIfNotString(maybeCoerceStringToNullableNumber);
      } else {
        return passThroughIfNotString(maybeCoerceStringToNonNullableNumber);
      }
    case 'null':
      return passThroughIfNotString(maybeCoerceStringToNull);
    default:
      return (value: unknown): unknown => value;
  }
}

export function buildQueryParse(
  openApiResolver: OpenApiResolver,
  schema: JsonSchema | undefined,
  schemaRef: string,
): (value: unknown) => unknown {
  const {
    isNullable,
    type,
  }: {
    isNullable: boolean;
    type: JsonSchemaType;
  } = inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
    openApiResolver,
    schema,
    schemaRef,
  );

  return buildQueryParseFromType(isNullable, type);
}
