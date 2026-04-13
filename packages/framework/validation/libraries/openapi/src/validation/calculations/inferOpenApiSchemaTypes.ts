import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonSchema,
  type JsonSchemaObject,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';

const ALL_JSON_SCHEMA_TYPES: Set<JsonSchemaType> = new Set([
  'array',
  'boolean',
  'integer',
  'null',
  'number',
  'object',
  'string',
]);

export function inferOpenApiSchemaTypes(
  openApiResolver: OpenApiResolver,
  reference: string,
): Set<JsonSchemaType> {
  const schema: JsonValue | undefined =
    openApiResolver.deepResolveReference(reference);

  if (schema === undefined) {
    throw new Error(
      `Unable to resolve JSON pointer "${reference}" in the OpenAPI object`,
    );
  }

  return normalizeNumericTypes(
    inferTypesFromSchema(openApiResolver, schema as JsonSchema),
  );
}

function inferTypesFromSchema(
  openApiResolver: OpenApiResolver,
  schema: JsonSchema,
): Set<JsonSchemaType> {
  if (typeof schema === 'boolean') {
    return schema ? new Set(ALL_JSON_SCHEMA_TYPES) : new Set();
  }

  if (schema.$ref !== undefined) {
    return inferOpenApiSchemaTypes(openApiResolver, schema.$ref);
  }

  if (schema.$dynamicRef !== undefined) {
    throw new Error(
      'Unable to determine schema types: "$dynamicRef" is not supported',
    );
  }

  if (schema.oneOf !== undefined) {
    throw new Error(
      'Unable to determine schema types: "oneOf" is not supported',
    );
  }

  if (schema.not !== undefined) {
    throw new Error('Unable to determine schema types: "not" is not supported');
  }

  const typeSet: Set<JsonSchemaType> | undefined = buildTypeSet(schema);

  if (schema.allOf !== undefined) {
    return constrainWithType(
      intersectAll(openApiResolver, schema.allOf),
      typeSet,
    );
  }

  if (schema.anyOf !== undefined) {
    return constrainWithType(unionAll(openApiResolver, schema.anyOf), typeSet);
  }

  if (typeSet !== undefined) {
    return typeSet;
  }

  return new Set(ALL_JSON_SCHEMA_TYPES);
}

function buildTypeSet(
  schema: JsonSchemaObject,
): Set<JsonSchemaType> | undefined {
  if (schema.type === undefined) {
    return undefined;
  }

  if (Array.isArray(schema.type)) {
    return new Set(schema.type);
  }

  return new Set([schema.type]);
}

function intersectAll(
  openApiResolver: OpenApiResolver,
  schemas: JsonSchema[],
): Set<JsonSchemaType> {
  let result: Set<JsonSchemaType> = inferTypesFromSchema(
    openApiResolver,
    schemas[0] as JsonSchema,
  );

  for (let i: number = 1; i < schemas.length; i++) {
    const childTypes: Set<JsonSchemaType> = inferTypesFromSchema(
      openApiResolver,
      schemas[i] as JsonSchema,
    );
    result = intersectSets(result, childTypes);
  }

  return result;
}

function unionAll(
  openApiResolver: OpenApiResolver,
  schemas: JsonSchema[],
): Set<JsonSchemaType> {
  const result: Set<JsonSchemaType> = new Set();

  for (const child of schemas) {
    for (const type of inferTypesFromSchema(openApiResolver, child)) {
      result.add(type);
    }
  }

  return normalizeNumericTypes(result);
}

function constrainWithType(
  result: Set<JsonSchemaType>,
  typeSet: Set<JsonSchemaType> | undefined,
): Set<JsonSchemaType> {
  if (typeSet === undefined) {
    return result;
  }

  return intersectSets(result, typeSet);
}

function intersectSets(
  a: Set<JsonSchemaType>,
  b: Set<JsonSchemaType>,
): Set<JsonSchemaType> {
  const [smaller, larger]: [Set<JsonSchemaType>, Set<JsonSchemaType>] =
    a.size <= b.size ? [a, b] : [b, a];

  const result: Set<JsonSchemaType> = new Set();

  for (const value of smaller) {
    if (larger.has(value)) {
      result.add(value);
    }
  }

  // integer is a subtype of number: number ∩ integer = integer
  if (
    !result.has('integer') &&
    ((a.has('number') && b.has('integer')) ||
      (a.has('integer') && b.has('number')))
  ) {
    result.add('integer');
  }

  return normalizeNumericTypes(result);
}

function normalizeNumericTypes(
  types: Set<JsonSchemaType>,
): Set<JsonSchemaType> {
  if (types.has('number') && types.has('integer')) {
    const normalized: Set<JsonSchemaType> = new Set(types);
    normalized.delete('integer');
    return normalized;
  }

  return types;
}
