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

export function inferSchemaTypeOrPrimitivaSchemaTypeOrThrow(
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
    const primitiveTypes: JsonSchemaType[] = [...typesSet].filter(
      (t: JsonSchemaType): boolean =>
        t === 'string' || t === 'number' || t === 'integer' || t === 'boolean',
    );

    if (primitiveTypes.length !== 1) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.invalidConfiguration,
        `Unable to determine parameter "${schemaRef}" type: expected exactly 1 type but found "${[...typesSet].join(', ')}"`,
      );
    }

    const [type]: [JsonSchemaType] = primitiveTypes as [JsonSchemaType];

    const isNullable: boolean = typesSet.has('null');

    return {
      isNullable,
      type,
    };
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
