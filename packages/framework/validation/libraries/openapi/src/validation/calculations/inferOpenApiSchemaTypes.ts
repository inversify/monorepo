import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type JsonSchema,
  type JsonSchemaObject,
  type JsonSchemaType,
} from '@inversifyjs/json-schema-types/2020-12';
import {
  type SchemaResolutionSuccessLinks,
  type SchemaResolutionSuccessNode,
} from '@inversifyjs/json-schema-utils/2020-12';

import {
  type JsonSchemaResolutionResult,
  type OpenApiResolver,
} from '../services/OpenApiResolver.js';

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
  schema: JsonSchema,
): Set<JsonSchemaType> {
  return normalizeNumericTypes(
    inferTypesFromSchema(openApiResolver, schema, new Set()),
  );
}

function inferTypesFromSchema(
  openApiResolver: OpenApiResolver,
  schema: JsonSchema,
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> {
  if (typeof schema === 'boolean') {
    return schema ? new Set(ALL_JSON_SCHEMA_TYPES) : new Set();
  }

  const nextVisitedSchemas: ReadonlySet<JsonSchemaObject> =
    addVisitedSchemaOrThrow(visitedSchemas, schema);

  const ownTypeSet: Set<JsonSchemaType> = inferOwnTypeSet(
    openApiResolver,
    schema,
    nextVisitedSchemas,
  );

  if (schema.$ref === undefined && schema.$dynamicRef === undefined) {
    return ownTypeSet;
  }

  /*
   * $ref/$dynamicRef are applicators, not substitutions: the instance must
   * also satisfy every schema reached by following them, on top of this
   * schema's own keywords. Embed the whole resolved chain as an implicit
   * allOf instead of jumping straight to the referenced schema.
   */
  const resolutionResult: JsonSchemaResolutionResult =
    openApiResolver.resolveJsonSchema(schema);

  if (!resolutionResult.isRight) {
    return new Set();
  }

  return constrainWithType(
    ownTypeSet,
    inferResolutionLinksTypeSet(
      openApiResolver,
      resolutionResult.value,
      nextVisitedSchemas,
    ),
  );
}

function inferOwnTypeSet(
  openApiResolver: OpenApiResolver,
  schema: JsonSchemaObject,
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> {
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
      intersectAll(openApiResolver, schema.allOf, visitedSchemas),
      typeSet,
    );
  }

  if (schema.anyOf !== undefined) {
    return constrainWithType(
      unionAll(openApiResolver, schema.anyOf, visitedSchemas),
      typeSet,
    );
  }

  if (typeSet !== undefined) {
    return typeSet;
  }

  return new Set(ALL_JSON_SCHEMA_TYPES);
}

function inferResolutionLinksTypeSet(
  openApiResolver: OpenApiResolver,
  links: SchemaResolutionSuccessLinks,
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> | undefined {
  const refTypeSet: Set<JsonSchemaType> | undefined =
    links.$ref === undefined
      ? undefined
      : inferResolutionNodeTypeSet(openApiResolver, links.$ref, visitedSchemas);

  const dynamicRefTypeSet: Set<JsonSchemaType> | undefined =
    links.$dynamicRef === undefined
      ? undefined
      : inferResolutionNodeTypeSet(
          openApiResolver,
          links.$dynamicRef,
          visitedSchemas,
        );

  if (refTypeSet === undefined) {
    return dynamicRefTypeSet;
  }

  return constrainWithType(refTypeSet, dynamicRefTypeSet);
}

function inferResolutionNodeTypeSet(
  openApiResolver: OpenApiResolver,
  node: SchemaResolutionSuccessNode,
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> {
  const resolvedValue: JsonValue = node.value;

  if (typeof resolvedValue === 'boolean') {
    return resolvedValue ? new Set(ALL_JSON_SCHEMA_TYPES) : new Set();
  }

  if (
    resolvedValue === null ||
    typeof resolvedValue !== 'object' ||
    Array.isArray(resolvedValue)
  ) {
    return new Set();
  }

  const schema: JsonSchemaObject = resolvedValue;

  const nextVisitedSchemas: ReadonlySet<JsonSchemaObject> =
    addVisitedSchemaOrThrow(visitedSchemas, schema);

  return constrainWithType(
    inferOwnTypeSet(openApiResolver, schema, nextVisitedSchemas),
    inferResolutionLinksTypeSet(openApiResolver, node, nextVisitedSchemas),
  );
}

// Breaks $ref/$dynamicRef cycles reachable through allOf/anyOf compositions.
function addVisitedSchemaOrThrow(
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
  schema: JsonSchemaObject,
): ReadonlySet<JsonSchemaObject> {
  if (visitedSchemas.has(schema)) {
    throw new Error(
      'Unable to determine schema types: circular schema reference detected',
    );
  }

  return new Set(visitedSchemas).add(schema);
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
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> {
  if (schemas.length === 0) {
    return new Set();
  }

  let result: Set<JsonSchemaType> = inferTypesFromSchema(
    openApiResolver,
    schemas[0] as JsonSchema,
    visitedSchemas,
  );

  for (let i: number = 1; i < schemas.length; i++) {
    const childTypes: Set<JsonSchemaType> = inferTypesFromSchema(
      openApiResolver,
      schemas[i] as JsonSchema,
      visitedSchemas,
    );
    result = intersectSets(result, childTypes);
  }

  return result;
}

function unionAll(
  openApiResolver: OpenApiResolver,
  schemas: JsonSchema[],
  visitedSchemas: ReadonlySet<JsonSchemaObject>,
): Set<JsonSchemaType> {
  const result: Set<JsonSchemaType> = new Set();

  for (const child of schemas) {
    for (const type of inferTypesFromSchema(
      openApiResolver,
      child,
      visitedSchemas,
    )) {
      result.add(type);
    }
  }

  return result;
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

  return result;
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
