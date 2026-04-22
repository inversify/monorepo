import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonSchema,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { buildNonArrayParamParse } from './buildNonArrayParamParse.js';
import { inferSchemaTypeOrThrow } from './inferSchemaTypeOrThrow.js';

export function buildParamParse(
  openApiResolver: OpenApiResolver,
  schema: JsonSchema | undefined,
  schemaRef: string,
): (value: string | string[] | undefined) => unknown {
  const {
    isNullable,
    type,
  }: {
    isNullable: boolean;
    type: JsonSchemaType;
  } = inferSchemaTypeOrThrow(openApiResolver, schema, schemaRef);

  let parse: (value: string | string[] | undefined) => unknown;

  switch (type) {
    case 'array':
      {
        const itemsSchemaRef: string = `${schemaRef}/items`;

        const schema: JsonValue | undefined =
          openApiResolver.deepResolveReference(itemsSchemaRef);

        const {
          isNullable,
          type,
        }: {
          isNullable: boolean;
          type: JsonSchemaType;
        } = inferSchemaTypeOrThrow(
          openApiResolver,
          schema as JsonSchema | undefined,
          itemsSchemaRef,
        );

        parse = buildNonArrayParamParse(isNullable, itemsSchemaRef, type);
      }
      break;
    default:
      parse = buildNonArrayParamParse(isNullable, schemaRef, type);
  }

  return parse;
}
