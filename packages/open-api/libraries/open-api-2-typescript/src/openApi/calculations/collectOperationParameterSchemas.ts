import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import { type JsonSchema } from '@inversifyjs/json-schema-types/2020-12';

import { buildOperationTypeName } from './buildOperationTypeName.js';
import {
  getParameterLocationTypeNameSuffix,
  PARAMETER_LOCATION_ORDER,
} from './getParameterLocationTypeNameSuffix.js';
import { isIgnoredHeaderParameter } from './isIgnoredHeaderParameter.js';
import { resolveParameter } from './resolveParameter.js';
import { resolvePathItem } from './resolvePathItem.js';

export interface CollectOperationParameterSchemasParams {
  documentBaseUri: string;
  resolveId: (id: string) => JsonValue | undefined;
}

const PATH_ITEM_OPERATION_KEYS: readonly string[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
  'query',
];

export function collectOperationParameterSchemas(
  document: JsonValue,
  params: CollectOperationParameterSchemasParams,
): JsonSchema[] {
  if (!isJsonValueObject(document)) {
    return [];
  }

  const namedSchemas: JsonSchema[] = [];

  appendPathMapOperationParameterSchemas(
    document['paths'],
    namedSchemas,
    params,
  );
  appendPathMapOperationParameterSchemas(
    document['webhooks'],
    namedSchemas,
    params,
  );

  return namedSchemas;
}

function addParameters(
  merged: Map<string, JsonValueObject>,
  parameters: JsonValue | undefined,
  params: CollectOperationParameterSchemasParams,
): void {
  if (!Array.isArray(parameters)) {
    return;
  }

  for (const parameter of parameters) {
    const resolved: JsonValueObject | undefined = resolveParameter(
      parameter,
      params.documentBaseUri,
      params.resolveId,
      new Set(),
    );

    if (resolved === undefined) {
      continue;
    }

    const location: JsonValue | undefined = resolved['in'];
    const name: JsonValue | undefined = resolved['name'];

    if (typeof location !== 'string' || typeof name !== 'string') {
      continue;
    }

    if (getParameterLocationTypeNameSuffix(location) === undefined) {
      continue;
    }

    if (isIgnoredHeaderParameter(location, name)) {
      continue;
    }

    merged.set(`${location}:${name}`, resolved);
  }
}

function appendOperationParameterSchemas(
  path: string,
  pathItem: JsonValue,
  namedSchemas: JsonSchema[],
  params: CollectOperationParameterSchemasParams,
): void {
  const resolvedPathItem: JsonValueObject | undefined = resolvePathItem(
    pathItem,
    params.documentBaseUri,
    params.resolveId,
    new Set(),
  );

  if (resolvedPathItem === undefined) {
    return;
  }

  for (const { method, operation } of collectOperations(resolvedPathItem)) {
    const operationId: JsonValue | undefined = operation['operationId'];
    const operationTypeName: string = buildOperationTypeName(
      typeof operationId === 'string' ? operationId : undefined,
      method,
      path,
    );
    const groupedParameters: Map<string, JsonValueObject[]> =
      groupParametersByLocation(
        collectMergedParameters(resolvedPathItem, operation, params),
      );

    for (const location of PARAMETER_LOCATION_ORDER) {
      const parameters: JsonValueObject[] | undefined =
        groupedParameters.get(location);

      if (parameters === undefined || parameters.length === 0) {
        continue;
      }

      const suffix: string | undefined =
        getParameterLocationTypeNameSuffix(location);

      if (suffix === undefined) {
        continue;
      }

      namedSchemas.push(
        buildParameterLocationSchema(
          `${operationTypeName}${suffix}`,
          location,
          parameters,
        ),
      );
    }
  }
}

function appendPathMapOperationParameterSchemas(
  pathMap: JsonValue | undefined,
  namedSchemas: JsonSchema[],
  params: CollectOperationParameterSchemasParams,
): void {
  if (!isJsonValueObject(pathMap)) {
    return;
  }

  for (const [path, pathItem] of Object.entries(pathMap)) {
    appendOperationParameterSchemas(path, pathItem, namedSchemas, params);
  }
}

function buildParameterLocationSchema(
  title: string,
  location: string,
  parameters: JsonValueObject[],
): JsonSchema {
  if (location === 'querystring' && parameters.length === 1) {
    return schemaWithTitle(
      getParameterSchema(parameters[0] as JsonValueObject),
      title,
    );
  }

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const parameter of parameters) {
    const name: string = parameter['name'] as string;

    properties[name] = getParameterSchema(parameter);

    if (isRequiredParameter(parameter)) {
      required.push(name);
    }
  }

  const schema: JsonSchema = {
    properties,
    title,
    type: 'object',
  };

  if (required[0] !== undefined) {
    schema.required = [required[0], ...required.slice(1)];
  }

  return schema;
}

function collectMergedParameters(
  pathItem: JsonValueObject,
  operation: JsonValueObject,
  params: CollectOperationParameterSchemasParams,
): Map<string, JsonValueObject> {
  const merged: Map<string, JsonValueObject> = new Map();

  addParameters(merged, pathItem['parameters'], params);
  addParameters(merged, operation['parameters'], params);

  return merged;
}

function collectOperations(pathItem: JsonValueObject): {
  method: string;
  operation: JsonValueObject;
}[] {
  const operations: {
    method: string;
    operation: JsonValueObject;
  }[] = [];

  for (const method of PATH_ITEM_OPERATION_KEYS) {
    const operation: JsonValue | undefined = pathItem[method];

    if (isJsonValueObject(operation)) {
      operations.push({
        method,
        operation,
      });
    }
  }

  const additionalOperations: JsonValue | undefined =
    pathItem['additionalOperations'];

  if (isJsonValueObject(additionalOperations)) {
    for (const [method, operation] of Object.entries(additionalOperations)) {
      if (isJsonValueObject(operation)) {
        operations.push({
          method,
          operation,
        });
      }
    }
  }

  return operations;
}

function getParameterSchema(parameter: JsonValueObject): JsonSchema {
  const schema: JsonValue | undefined = parameter['schema'];

  if (isJsonSchema(schema)) {
    return schema;
  }

  const content: JsonValue | undefined = parameter['content'];

  if (isJsonValueObject(content)) {
    for (const mediaType of Object.values(content)) {
      if (!isJsonValueObject(mediaType)) {
        continue;
      }

      const mediaTypeSchema: JsonValue | undefined = mediaType['schema'];

      if (isJsonSchema(mediaTypeSchema)) {
        return mediaTypeSchema;
      }
    }
  }

  return true;
}

function groupParametersByLocation(
  merged: Map<string, JsonValueObject>,
): Map<string, JsonValueObject[]> {
  const grouped: Map<string, JsonValueObject[]> = new Map();

  for (const location of PARAMETER_LOCATION_ORDER) {
    grouped.set(location, []);
  }

  for (const parameter of merged.values()) {
    const location: string = parameter['in'] as string;
    const parameters: JsonValueObject[] | undefined = grouped.get(location);

    if (parameters !== undefined) {
      parameters.push(parameter);
    }
  }

  return grouped;
}

function isJsonSchema(value: JsonValue | undefined): value is JsonSchema {
  if (value === undefined) {
    return false;
  }

  if (typeof value === 'boolean') {
    return true;
  }

  return isJsonValueObject(value);
}

function isJsonValueObject(
  value: JsonValue | undefined,
): value is JsonValueObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isRequiredParameter(parameter: JsonValueObject): boolean {
  if (parameter['in'] === 'path') {
    return parameter['required'] !== false;
  }

  return parameter['required'] === true;
}

/**
 * Attach a TypeScript alias `title` without cloning the schema.
 *
 * The JSON Schema transformer keys resources by `$id`. Spreading an object
 * (`{ ...schema, title }`) would copy `$id` onto a second object and leave two
 * resources claiming the same URI.
 *
 * When the schema already has a URI, wrap it with `$ref` so the applicator
 * resolves the original resource:
 * - an existing `$ref` is reused as `{ title, $ref }`
 * - an `$id` is referenced as `{ title, $ref: schema.$id }`
 *
 * Inline schemas and booleans have no URI. `{ title, allOf: [schema] }` applies
 * the original value by identity so nested `$id`s stay unique.
 */
function schemaWithTitle(schema: JsonSchema, title: string): JsonSchema {
  if (isJsonValueObject(schema)) {
    const ref: JsonValue | undefined = schema['$ref'];

    if (typeof ref === 'string') {
      return {
        $ref: ref,
        title,
      };
    }

    const id: JsonValue | undefined = schema['$id'];

    if (typeof id === 'string') {
      return {
        $ref: id,
        title,
      };
    }
  }

  return {
    allOf: [schema],
    title,
  };
}
