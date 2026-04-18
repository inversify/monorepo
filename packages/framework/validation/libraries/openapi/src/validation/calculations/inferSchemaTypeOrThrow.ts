import {
  type JsonSchema,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { inferOpenApiSchemaTypes } from './inferOpenApiSchemaTypes.js';

const TYPES_ALLOWED_IF_NULLABLE: number = 2;

export function inferSchemaTypeOrThrow(
  openApiResolver: OpenApiResolver,
  schema: JsonSchema | undefined,
  schemaRef: string,
): {
  isNullable: boolean;
  type: JsonSchemaType;
} {
  const typesSet: Set<JsonSchemaType> =
    schema === undefined
      ? new Set()
      : inferOpenApiSchemaTypes(openApiResolver, schema);

  if (
    typesSet.size !== 1 &&
    !(typesSet.size === TYPES_ALLOWED_IF_NULLABLE && typesSet.has('null'))
  ) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.invalidConfiguration,
      `Unable to determine header parameter "${schemaRef}" type: expected exactly 1 type but found "${[...typesSet].join(', ')}"`,
    );
  }

  const isNullable: boolean = typesSet.has('null');

  const type: JsonSchemaType = [...typesSet].find(
    (t: JsonSchemaType): boolean => t !== 'null',
  ) as JsonSchemaType;

  return {
    isNullable,
    type,
  };
}
